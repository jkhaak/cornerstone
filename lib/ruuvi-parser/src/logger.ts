import pino from "pino";

let opts = {};

// eslint-disable-next-line dot-notation
if (process.env["DEV"]) {
  opts = { ...opts, level: "debug", transport: { target: "pino-pretty", options: { colorize: true } } };
}

export default pino(opts);
