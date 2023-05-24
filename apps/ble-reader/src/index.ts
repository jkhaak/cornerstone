import noble = require("@abandonware/noble");
import { logger, environment } from "@cornerstone/core";
import { Endpoint } from "./endpoint";
import type { DiscoveryData } from "./model";
import type { Peripheral } from "@abandonware/noble";

const envServiceEndpointUrl = "SERVICE_ENDPOINT_URL";
const SERVICE_ENDPOINT_URL = environment.getEnv(envServiceEndpointUrl);

if (SERVICE_ENDPOINT_URL === undefined) {
  logger.error({ message: `Environment variable ${envServiceEndpointUrl} is not set` });
  logger.debug({ env: process.env });
  process.exit(0);
}

const service = new Endpoint(SERVICE_ENDPOINT_URL);

function logUnknownError(fromFn: string) {
  return (error: unknown) => {
    if (error !== undefined) {
      logger.error({ error, fromFn });
    }
  };
}

function isSupported(peripheral: Peripheral): DiscoveryData {
  const { id, connectable, rssi, advertisement } = peripheral;
  const { manufacturerData, localName, txPowerLevel } = advertisement;

  if (manufacturerData[0] === 0x99 && manufacturerData[1] === 0x04) {
    logger.info({ message: "Found Ruuvi advertisement", id, txPowerLevel, rssi, connectable, localName });
    return { peripheral, manufacturerData };
  }

  logger.debug({ message: "unknown data", id, txPowerLevel, rssi, localName });
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
    .then(() => logger.info({ message: `data sent succesfully` }))
    .catch(logUnknownError("index.handleAdvertisement"));

  return data;
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

noble.on("discover", (peripheral: Peripheral) => {
  Promise.resolve(peripheral)
    .then(isSupported)
    .then(handleAdvertisement)
    .catch(logUnknownError("noble.on('discover')"));
});

noble.on("warning", (message: string) => {
  logger.warn({ message });
});

noble.on("scanStop", (state: string) => {
  logger.warn({ message: "scanning stopped", state });
});
