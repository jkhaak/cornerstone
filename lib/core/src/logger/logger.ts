import { pino } from "pino";
import { getEnvOrElse } from "../environment.js";

let opts = {};

const level = getEnvOrElse("LOG_LEVEL", "info").toLowerCase();

opts = { ...opts, level };

export { opts };

export default pino(opts);
