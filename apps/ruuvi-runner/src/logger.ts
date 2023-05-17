import pino from "pino";

let opts = {};

// eslint-disable-next-line dot-notation
if (process.env["DEV"]) {
  opts = { ...opts, level: "debug" };
}

export default pino(opts);
