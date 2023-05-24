import noble = require("@abandonware/noble");
import { logger, environment } from "@cornerstone/core";
import { Endpoint } from "./endpoint";
import type { DiscoveryData } from "./model";
import type { Peripheral } from "@abandonware/noble";

const envServiceEndpointUrl = "SERVICE_ENDPOINT_URL";
const SERVICE_ENDPOINT_URL = environment.getEnv(envServiceEndpointUrl);

if (SERVICE_ENDPOINT_URL === undefined) {
  logger.error({ __filename, message: `Environment variable ${envServiceEndpointUrl} is not set` });
  logger.debug({ __filename, env: process.env });
  process.exit(0);
}

const service = new Endpoint(SERVICE_ENDPOINT_URL);

function logUnknownError(error: unknown) {
  if (error !== undefined) {
    logger.error({ __filename, error });
  }
}

function isSupported(peripheral: Peripheral): DiscoveryData {
  const { manufacturerData, localName } = peripheral.advertisement;
  const { id, connectable } = peripheral;

  if (manufacturerData[0] === 0x99 && manufacturerData[1] === 0x04) {
    logger.debug({ __filename, message: "Found Ruuvi advertisement", id, connectable, localName });
    return { peripheral, manufacturerData };
  }

  logger.debug({ __filename, message: "unknown data", id, localName, manufacturerData });
  return undefined;
}

function handleAdvertisement(data: DiscoveryData): DiscoveryData {
  if (data === undefined) {
    return;
  }
  const { manufacturerData } = data;
  const manufacturerDataBase64 = manufacturerData.toString("base64");
  service
    .sendEvent({ manufacturerDataBase64 })
    .then(() => logger.debug({ __filename, message: `data sent succesfully` }))
    .catch(logUnknownError);

  return data;
}

function onDiscovery(peripheral: Peripheral) {
  Promise.resolve(peripheral).then(isSupported).then(handleAdvertisement).catch(logUnknownError);
}

noble.on("stateChange", (state: string) => {
  logger.info({ __filename, message: `Noble state changed to: ${state}` });
  if (state === "poweredOn") {
    noble
      .startScanningAsync([], false)
      .then(() => logger.info({ __filename, message: "noble started scanning" }))
      .catch(() => logger.error({ __filename, message: "noble failed to start scanning" }));
  }
});

noble.on("discover", onDiscovery);

noble.on("warning", (message: string) => {
  logger.warn({ __filename, message });
});

noble.on("scanStop", (state: string) => {
  logger.warn({ __filename, message: "scanning stopped", state });
});
