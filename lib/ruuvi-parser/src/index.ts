import type { on, startScanningAsync, Advertisement } from "@abandonware/noble";
import * as ruuvi from "./model/ruuvi";
import logger from "./logger";
import { format } from "./datetime";
import type { RuuviData } from "./model/formats/ruuvi-data-types";

export type { Format as DataFormat5 } from "./model/formats/data-format-5";

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

export function ruuviCollector({ noble }: { noble: Noble }) {
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
        logger.info({ peripheral: data });
      })
      .catch(() => {
        logger.error({ message: `unable to parse data from: ${peripheral.id}` });
      });
  });
}
