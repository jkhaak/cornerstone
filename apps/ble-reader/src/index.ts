import noble = require("@abandonware/noble");
import { logger, environment } from "@cornerstone/core";
import { Endpoint } from "./endpoint";
import type { DiscoveryData } from "./model";
import type { Peripheral } from "@abandonware/noble";
import { RuuviTagConnectionManager } from "./ruuvitag-connection-manager";

const envServiceEndpointUrl = "SERVICE_ENDPOINT_URL";
const SERVICE_ENDPOINT_URL = environment.getEnv(envServiceEndpointUrl);
const findTag = environment.getEnvOrElse("CONNECT_TAGS", "").toLowerCase().split(",");
const connectionManagers = findTag.map((tagId) => new RuuviTagConnectionManager(tagId));

if (SERVICE_ENDPOINT_URL === undefined) {
  logger.error({ message: `Environment variable ${envServiceEndpointUrl} is not set` });
  logger.debug({ env: process.env });
  process.exit(0);
}

const service = new Endpoint(SERVICE_ENDPOINT_URL);

function logUnknownError(error: unknown) {
  if (error !== undefined) {
    logger.error({ error });
  }
}

function connect(data: DiscoveryData) {
  if (data === undefined) {
    return undefined;
  }

  const { peripheral } = data;
  const id = peripheral.id;

  Promise.all(connectionManagers.map((cm) => cm.connect(peripheral)))
    .then(() => logger.info({ message: "connection succesful", id }))
    .catch(logUnknownError);

  return data;
}

function isSupported(peripheral: Peripheral): DiscoveryData {
  const { manufacturerData, localName } = peripheral.advertisement;
  const id = peripheral.id;

  const hexData = manufacturerData.toString("hex");
  if (hexData.startsWith("9904")) {
    logger.info({ message: "Found Ruuvi advertisement", id, localName });
    return { peripheral, manufacturerData };
  }

  logger.debug({ message: "unknown data", id, localName, hexData });
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
    .then(() => logger.debug({ message: `data sent succesfully` }))
    .catch(logUnknownError);

  return data;
}

function onDiscovery(peripheral: Peripheral) {
  Promise.resolve(peripheral)
    .then(isSupported)
    .then(connect)
    .then(handleAdvertisement)
    .catch(logUnknownError);
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
