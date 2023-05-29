import { logger } from "@cornerstone/core";
import { DBusError } from "dbus-next";
import type { Device } from "node-ble";
import { Endpoint } from "./endpoint";
import type { Event } from "./endpoint";
import { environment } from "@cornerstone/core";
import { setTimeout } from "node:timers/promises";
import { randOffset } from "./timer";

const envServiceEndpointUrl = "SERVICE_ENDPOINT_URL";
const SERVICE_ENDPOINT_URL = environment.getEnv(envServiceEndpointUrl);

/**
 * Check interval in milliseconds.
 */
const CHECK_INTERVAL = 60 * 1000;

if (SERVICE_ENDPOINT_URL === undefined) {
  logger.error({ message: `Environment variable ${envServiceEndpointUrl} is not set` });
  logger.debug({ env: process.env });
  process.exit(0);
}

const service = new Endpoint(SERVICE_ENDPOINT_URL);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function propToEvent(prop: any): Event {
  const prefix = Buffer.from("9904", "hex");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const data = prop["1177"].value as Buffer;

  return {
    manufacturerDataBase64: Buffer.concat([prefix, data]).toString("base64"),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ruuviTagListener(deviceId: string, device: any) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const prop: unknown = await device.helper.waitPropChange("ManufacturerData");
  const event = propToEvent(prop);
  logger.info({ message: "sending event", deviceId });
  await service.sendEvent(event);
  void setTimeout(CHECK_INTERVAL + randOffset(2 * 1000)).then(() => ruuviTagListener(deviceId, device));
}

export function handleNewDevice(deviceId: string, device: Device) {
  device
    .getAlias()
    .then((alias) => {
      if (alias.startsWith("Ruuvi")) {
        logger.info({ message: "start listener for ruuvi tag", deviceId, alias });
        void ruuviTagListener(deviceId, device);
      }
      // ignore device
    })
    .catch((error: unknown) => {
      if (error instanceof DBusError && error.text.match(/No such property 'Name'/)) {
        logger.debug({ message: "device doesn't have a name", deviceId });
      } else {
        logger.error({ message: "unexpected error while getting the name of the device", deviceId, error });
      }
    });
}
