import pino from "pino";
import { getEnvOrElse } from "../environment";

let opts = {};

const level = getEnvOrElse("LOG_LEVEL", "info");

opts = { ...opts, level };

export { opts };

export default pino(opts);
