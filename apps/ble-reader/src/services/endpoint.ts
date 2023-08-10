import type { Mqtt } from "@cornerstone/mqtt";
import type { EventHandler } from "./ruuvi";

export function sendEvent(mqtt: Mqtt): EventHandler {
  return (obj: object) => mqtt.publish("ruuvi/event", JSON.stringify(obj));
}
