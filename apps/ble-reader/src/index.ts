import { environment, logger } from "@cornerstone/core";
import { createBluetooth } from "./services/bluetooth";
import { RuuviService } from "./services/ruuvi";
import { sendEvent } from "./services/endpoint";
import type { NewDeviceEventParams } from "./services/bluetooth";
import { setTimeout } from "timers/promises";

const envServiceEndpointUrl = "SERVICE_ENDPOINT_URL";
const SERVICE_ENDPOINT_URL = environment.getEnv(envServiceEndpointUrl);

if (SERVICE_ENDPOINT_URL === undefined) {
  logger.error({ message: `Environment variable ${envServiceEndpointUrl} is not set` });
  logger.debug({ env: process.env });
  process.exit(0);
}

function main() {
  const bluetooth = createBluetooth();
  const ruuviService = new RuuviService();
  ruuviService.setEndpoint(sendEvent);

  bluetooth
    .startDiscovery()
    .then(() => setTimeout(5000))
    .then(() => bluetooth.startDeviceDiscovery())
    .then(() => {
      bluetooth.on("newDevice", (...args: NewDeviceEventParams) => ruuviService.handleNewDevice(...args));
    })
    .catch((error: unknown) => logger.error({ message: "unexpected error happened", error }));
}

main();
