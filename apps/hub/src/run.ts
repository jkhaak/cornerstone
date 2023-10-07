import { Mqtt } from "@cornerstone/mqtt";
import type { Config } from "./model/config.js";

export function run(config: Config) {
  const mqtt = new Mqtt(config.mqtt);
}
