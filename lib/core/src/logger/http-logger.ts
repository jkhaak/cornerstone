import { pinoHttp as pinoHttpInit } from "pino-http";
import { opts } from "./logger";

export default pinoHttpInit(opts);
