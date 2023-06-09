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
