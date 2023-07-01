import { environment, logger } from "@cornerstone/core";
import { createBluetooth } from "./services/bluetooth";
import { RuuviService } from "./services/ruuvi";
import { sendEvent } from "./services/endpoint";
import type { NewDeviceEventParams } from "./services/bluetooth";
import { setTimeout } from "timers/promises";

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
