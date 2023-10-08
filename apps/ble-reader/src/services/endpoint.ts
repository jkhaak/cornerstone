import type { Mqtt } from "@cornerstone/mqtt";
import type { EventHandler } from "./ruuvi";

export function sendEvent(mqtt: Mqtt): EventHandler {
  return (topic: string, obj: object) => mqtt.publish(topic, JSON.stringify(obj));
}
