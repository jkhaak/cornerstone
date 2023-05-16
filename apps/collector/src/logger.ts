import pino from "pino";
import { pinoHttp as pinoHttpInit } from "pino-http";

let opts = {};

// eslint-disable-next-line dot-notation
if (process.env["DEV"]) {
  opts = { ...opts, level: "debug" };
}

const logger = pino(opts);
const pinoHttp = pinoHttpInit(opts);

export { logger, pinoHttp };
