import * as mqtt from "mqtt";
import { getEnvOrThrow } from "@cornerstone/core/dist/environment";
import { logger } from "@cornerstone/core";

const client = mqtt.connect(getEnvOrThrow("MQTT_URL"));

export function publish(topic: string, message: string) {
  logger.info(`Publishing message to ${topic}`);
  client.publish(topic, message);
}

export function subscribe(topic: string, callback: (message: string) => void) {
  logger.info(`Subscribing to ${topic}`);
  client.subscribe(topic);
  client.on("message", (topic, message) => {
    logger.info(`Received message on ${topic}`);
    callback(message.toString());
  });
}

export function subscribeAsync(topic: string, callback: (message: string) => Promise<void>) {
  logger.info(`Subscribing to ${topic}`);
  client.subscribe(topic);
  client.on("message", (topic, message) => {
    logger.info(`Received message on ${topic}`);
    callback(message.toString()).catch((error: unknown) =>
      logger.error({ mesage: "Error processing message", topic, message, error })
    );
  });
}

export function close() {
  logger.info("Closing MQTT connection");
  client.end();
}
