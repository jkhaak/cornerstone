import * as mqtt from "mqtt";
import { logger } from "@cornerstone/core";
import _ from "lodash";

export type MqttOptions = {
  username?: string;
  password?: string;
  url: string;
};

export type SubscribeCallback<ReturnType = void> = (message: Buffer) => ReturnType;

export class Mqtt {
  private _client: mqtt.MqttClient;

  public constructor(opts: MqttOptions) {
    const _opts = _.omitBy(opts, (prop) => _.isNil(prop));

    this._client = mqtt.connect(opts.url, _opts);
  }

  public publish(topic: string, message: string) {
    logger.info(`Publishing message to ${topic}`);
    this._client.publish(topic, message);
  }

  public subscribe(topic: string, callback: SubscribeCallback) {
    logger.info(`Subscribing to ${topic}`);
    this._client.subscribe(topic);
    this._client.on("message", (topic: string, message: Buffer) => {
      logger.info({ message: `Received message on ${topic}` });
      callback(message);
    });
  }

  public subscribeAsync(topic: string, callback: SubscribeCallback<Promise<void>>) {
    logger.info(`Subscribing to ${topic}`);
    this._client.subscribe(topic);

    this._client.on("message", (topic: string, message: Buffer) => {
      logger.info(`Received message on ${topic}`);
      callback(message).catch((error: unknown) =>
        logger.error({ message: "Error processing message", topic, mqttMessage: message.toString(), error })
      );
    });
  }

  public close() {
    logger.info("Closing MQTT connection");
    this._client.end();
  }
}
