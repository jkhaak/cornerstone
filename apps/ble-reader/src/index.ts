import noble = require("@abandonware/noble");
import { logger, environment } from "@cornerstone/core";
import { Endpoint } from "./endpoint";
import type { NobleAdvertisement } from "./model";

const envServiceEndpointUrl = "SERVICE_ENDPOINT_URL";
const SERVICE_ENDPOINT_URL = environment.getEnv(envServiceEndpointUrl);

if (SERVICE_ENDPOINT_URL === undefined) {
  logger.error({ message: `Environment variable ${envServiceEndpointUrl} is not set` });
  logger.debug({ env: process.env });
  process.exit(0);
}

const service = new Endpoint(SERVICE_ENDPOINT_URL);

function onDiscovery(peripheral: noble.Peripheral) {
  Promise.resolve(peripheral)
    .then(({ id, advertisement }: NobleAdvertisement) => {
      const { manufacturerData, localName } = advertisement;
      const hexData = manufacturerData.toString("hex");
      if (hexData.startsWith("0499")) {
        logger.info({ message: "Found Ruuvi advertisement", id, localName });
        return manufacturerData;
      }
      logger.debug({ message: "unknown data", id, localName, hexData });
      return undefined;
    })
    .then((manufacturerData) => {
      if (!manufacturerData) {
        return;
      }
      const manufacturerDataBase64 = manufacturerData.toString("base64");
      return service
        .sendEvent({ manufacturerDataBase64 })
        .then(() => logger.debug({ message: `data sent succesfully` }));
    })
    .catch((error: unknown) => {
      logger.error({ error });
    });
}

noble.on("stateChange", (state: string) => {
  logger.info({ message: `Noble state changed to: ${state}` });
  if (state === "poweredOn") {
    noble
      .startScanningAsync([], false)
      .then(() => logger.info({ message: "noble started scanning" }))
      .catch(() => logger.error({ message: "noble failed to start scanning" }));
  }
});

noble.on("discover", onDiscovery);
