import express from "express";
import type { Express } from "express";
import { httpLogger } from "@cornerstone/core";
import ruuviRouter from "./routes/ruuvi";
import { validationErrorHandler, zodErrorHandler } from "./server/error-handler";

export function initServer(app: Express) {
  app.use(express.json());
  app.use(httpLogger);

  app.use("/ruuvi", ruuviRouter);

  // Error handlers
  app.use(zodErrorHandler);
  app.use(validationErrorHandler);
  return app;
}
