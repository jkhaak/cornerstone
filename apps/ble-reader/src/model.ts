import { type } from "arktype";
import { logger, config } from "@cornerstone/core";
import type { Device as NodeBLEDevice } from "node-ble";

/** Undocumented Node BLE api */
export type DeviceProp = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  "1177": {
    value: Buffer;
  };
};

export type Device = {
  /** Undocumented Node BLE api */
  helper: {
    waitPropChange: (prop: string) => Promise<DeviceProp>;
  };
} & NodeBLEDevice;

export const configSchema = type({
  mqtt: {
    url: "string",
    "username?": "string",
    "password?": "string",
  },
  daemon: {
    "pidfile?": "string",
    "uid?": "number",
    "gid?": "number",
  },
});

export type Config = typeof configSchema.infer;
export type MqttConfig = Config["mqtt"];
export type DaemonConfig = Config["daemon"];

export function getConfig(path: string): Config {
  try {
    return config.parseConfig(path, configSchema);
  } catch (error) {
    if (error instanceof Error) {
      logger.error({ message: error.message });
    } else {
      logger.error({ message: "Unknown error occured", error });
    }
    process.exit(1);
  }
}
