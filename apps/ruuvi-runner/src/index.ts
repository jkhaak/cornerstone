import noble = require("@abandonware/noble");
import type { on, startScanningAsync, Advertisement } from "@abandonware/noble";
import { ruuvi } from "@cornerstone/ruuvi-parser";
import type { RuuviData } from "@cornerstone/ruuvi-parser";
import { logger } from "@cornerstone/core";
import { format } from "./datetime";
import { Endpoint } from "./endpoint";
import { environment } from "@cornerstone/core";

const envServiceEndpointUrl = "SERVICE_ENDPOINT_URL";
const SERVICE_ENDPOINT_URL = environment.getEnv(envServiceEndpointUrl);

if (SERVICE_ENDPOINT_URL === undefined) {
  logger.error({ message: `Environment variable ${envServiceEndpointUrl} is not set` });
  logger.debug({ env: process.env });
  process.exit(0);
}

const service = new Endpoint(SERVICE_ENDPOINT_URL);

export type Noble = {
  on: typeof on;
  startScanningAsync: typeof startScanningAsync;
};

export type Event = {
  id: string;
  localName: string;
  datetime: string;
  manufacturerDataHex: string | undefined;
  data: RuuviData;
};

type NobleAdvertisement = {
  id: string;
  advertisement: Advertisement;
};

function peripheralToString({ id, advertisement }: NobleAdvertisement): Promise<Event> {
  const manufacturerDataHex = advertisement.manufacturerData
    ? Buffer.from(advertisement.manufacturerData).toString("hex")
    : undefined;

  const manufacturerData: Buffer | undefined = advertisement?.manufacturerData;

  const info = {
    id,
    localName: advertisement.localName,
    datetime: format(new Date()),
    manufacturerDataHex,
  };

  if (manufacturerData === undefined) {
    logger.debug({ ...info, error: `manufacturerData is undefined` });
    return Promise.reject();
  }

  return ruuvi
    .parseAsync(manufacturerData)
    .then((data) => ({ ...info, data } satisfies Event))
    .catch((error: Error) => {
      if (error.message === "Unknown manufacturer id") {
        logger.debug({ ...info, error: error.message });
      } else {
        logger.error({ ...info, error: error.message });
      }
      return Promise.reject();
    });
}

function ruuviCollector({ noble }: { noble: Noble }) {
  noble.on("stateChange", (state: string) => {
    logger.info({ message: `Noble state changed to: ${state}` });
    if (state === "poweredOn") {
      noble
        .startScanningAsync([], false)
        .then(() => logger.info({ message: "noble started scanning" }))
        .catch(() => logger.error({ message: "noble failed to start scanning" }));
    }
  });

  noble.on("discover", (peripheral) => {
    peripheralToString(peripheral)
      .then((data) => {
        logger.debug({ message: "parsed peripheral data", peripheral: data });
        return service
          .sendEvent(data)
          .then(() => logger.debug({ message: "event sent succesfully" }))
          .catch((error: unknown) => logger.error({ message: "Unable to send event", error }));
      })
      .catch(() => {
        logger.error({ message: `Unable to parse data from: ${peripheral.id}` });
      });
  });
}

ruuviCollector({ noble });
