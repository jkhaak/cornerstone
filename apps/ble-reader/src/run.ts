import { logger } from "@cornerstone/core";
import { Bluetooth } from "./services/bluetooth";
import { RuuviService } from "./services/ruuvi";
import { sendEvent } from "./services/endpoint";
import type { NewDeviceEventParams } from "./services/bluetooth";
import { Mqtt } from "@cornerstone/mqtt";
import type { MqttConfig } from "./model";

export function run(mqttProps: MqttConfig) {
  const bluetooth = Bluetooth.init();

  const mqtt = new Mqtt(mqttProps);

  const ruuviService = new RuuviService();
  ruuviService.setEndpoint(sendEvent(mqtt));

  bluetooth
    .startDiscovery()
    .then(() => bluetooth.startDeviceDiscovery())
    .then(() => {
      bluetooth.on("newDevice", (...args: NewDeviceEventParams) => ruuviService.handleNewDevice(...args));
    })
    .catch((error: unknown) => logger.error({ message: "unexpected error happened", error }));
}
