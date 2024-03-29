import { type } from "arktype";
import { logger, config } from "@cornerstone/core";

export const configSchema = type({
  mqtt: {
    url: "string",
    "username?": "string",
    "password?": "string",
  },
  database: {
    cn: /^[^:]+:\/\/[^:]+(?::[^@]+)?@[^:]+(?::[^/]+\/)?[^\s]+$/,
  },
  "daemon?": {
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
