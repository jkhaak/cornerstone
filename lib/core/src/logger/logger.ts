import pino from "pino";
import { getEnv } from "../environment";

let opts = {};

if (getEnv("DEV") || getEnv("DEBUG")) {
  opts = { ...opts, level: "debug" };
}

export { opts };

export default pino(opts);
