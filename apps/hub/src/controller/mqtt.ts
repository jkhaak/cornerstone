import { Mqtt } from "@cornerstone/mqtt";
import { storeEvent } from "../service/ruuvi";

export function ruuvitagMqttController(mqtt: Mqtt) {
  mqtt.subscribeAsync("ruuvi/event/#", storeEvent);
}
