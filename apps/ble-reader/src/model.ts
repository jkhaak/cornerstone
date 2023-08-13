import { type } from "arktype";

export const ConfigSchema = type({
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

export type Config = typeof ConfigSchema.infer;
