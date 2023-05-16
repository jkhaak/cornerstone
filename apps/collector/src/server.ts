import express from "express";
import { pinoHttp } from "./logger";
import ruuviRouter from "./routes/ruuvi";
import { zodErrorHandler } from "./server/error-handler";

const app = express();
app.use(express.json());
app.use(pinoHttp);

app.use("/ruuvi", ruuviRouter);

// Error handlers
app.use(zodErrorHandler);

export default app;
