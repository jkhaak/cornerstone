import { Mqtt } from "@cornerstone/mqtt";
import type { Config } from "./model/config";
import { ruuvitagMqttController } from "./controller/mqtt";

export function run(config: Config) {
  const mqtt = new Mqtt(config.mqtt);
  ruuvitagMqttController(mqtt);
}
