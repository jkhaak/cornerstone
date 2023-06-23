import * as mqtt from "@cornerstone/mqtt";

export type Event = {
  manufacturerDataBase64: string;
};

export function sendEvent(event: Event) {
  mqtt.publish("ruuvi/event", JSON.stringify(event));
}
