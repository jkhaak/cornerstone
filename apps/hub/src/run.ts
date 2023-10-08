import { Mqtt } from "@cornerstone/mqtt";
import type { Config } from "./model/config.js";
import { ruuvitagMqttController } from "./controller/mqtt.js";

export function run(config: Config) {
  const mqtt = new Mqtt(config.mqtt);
  ruuvitagMqttController(mqtt);
}
