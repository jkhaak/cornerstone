import { pinoHttp as pinoHttpInit } from "pino-http";
import { opts } from "./logger.js";

export default pinoHttpInit(opts);
