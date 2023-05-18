import { pinoHttp as pinoHttpInit } from "pino-http";
import { opts } from "./logger";

const httpLogger = pinoHttpInit(opts);

export { httpLogger };
