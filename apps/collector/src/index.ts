import { getEnvOrElse } from "@cornerstone/core/dist/environment";
import { logger } from "@cornerstone/core";
import { initServer } from "./server";
import express from "express";
import compression from "compression";

const port = parseInt(getEnvOrElse("PORT", "3000"), 10);

const app = express();
app.use(compression());

initServer(app);

app.listen(port, () => {
  logger.info({ message: "Express server started", port });
});
