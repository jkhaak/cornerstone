import express from "express";
import { httpLogger } from "@cornerstone/core";
import ruuviRouter from "./routes/ruuvi";
import { zodErrorHandler } from "./server/error-handler";

const app = express();
app.use(express.json());
app.use(httpLogger);

app.use("/ruuvi", ruuviRouter);

// Error handlers
app.use(zodErrorHandler);

export default app;
