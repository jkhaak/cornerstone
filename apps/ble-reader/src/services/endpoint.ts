import type { Mqtt } from "@cornerstone/mqtt";

export type Event = {
  manufacturerDataBase64: string;
};

export function sendEvent(mqtt: Mqtt) {
  return (event: Event) => mqtt.publish("ruuvi/event", JSON.stringify(event));
}
