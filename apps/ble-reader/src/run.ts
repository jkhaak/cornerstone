import { logger } from "@cornerstone/core";
import { Bluetooth } from "./services/bluetooth.js";
import { RuuviService } from "./services/ruuvi.js";
import { sendEvent } from "./services/endpoint.js";
import type { NewDeviceEventParams } from "./services/bluetooth.js";
import { setTimeout } from "timers/promises";
import { Mqtt } from "@cornerstone/mqtt";
import type { Config } from "./model.js";

export function run(props: Config) {
  const bluetooth = Bluetooth.init();

  const mqtt = new Mqtt(props.mqtt);

  const ruuviService = new RuuviService();
  ruuviService.setEndpoint(sendEvent(mqtt));

  bluetooth
    .startDiscovery()
    .then(() => setTimeout(5000))
    .then(() => bluetooth.startDeviceDiscovery())
    .then(() => {
      bluetooth.on("newDevice", (...args: NewDeviceEventParams) => ruuviService.handleNewDevice(...args));
    })
    .catch((error: unknown) => logger.error({ message: "unexpected error happened", error }));
}
