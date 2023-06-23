import * as mqtt from "mqtt";
import { getEnv, getEnvOrThrow } from "@cornerstone/core/dist/environment";
import { logger } from "@cornerstone/core";
import _ from "lodash";

const opts = _.omitBy(
  {
    username: getEnv("MQTT_USERNAME"),
    password: getEnv("MQTT_PASSWORD"),
  },
  (prop) => _.isNil(prop)
);

const client = mqtt.connect(getEnvOrThrow("MQTT_URL"), opts);

export function publish(topic: string, message: string) {
  logger.info(`Publishing message to ${topic}`);
  client.publish(topic, message);
}

export function subscribe(topic: string, callback: (message: Buffer) => void) {
  logger.info(`Subscribing to ${topic}`);
  client.subscribe(topic);
  client.on("message", (topic: string, message: Buffer) => {
    logger.info({ message: `Received message on ${topic}` });
    callback(message);
  });
}

export function subscribeAsync(topic: string, callback: (message: Buffer) => Promise<void>) {
  logger.info(`Subscribing to ${topic}`);
  client.subscribe(topic);

  client.on("message", (topic: string, message: Buffer) => {
    logger.info(`Received message on ${topic}`);
    callback(message).catch((error: unknown) =>
      logger.error({ message: "Error processing message", topic, mqttMessage: message.toString(), error })
    );
  });
}

export function close() {
  logger.info("Closing MQTT connection");
  client.end();
}
