import { Mqtt } from "@cornerstone/mqtt";
import type { Config } from "./model.js";
import { getDB } from "./database.js";
import { storeService } from "./store-service.js";

export function run(config: Config) {
  const state = {
    mqtt: new Mqtt(config.mqtt),
    db: getDB(config.database),
  };
  storeService(state);
}
