import { getEnvOrElse } from "./environment";
import { logger } from "./logger";
import app from "./server";

const port = parseInt(getEnvOrElse("PORT", "3000"), 10);

app.listen(port, () => {
  logger.info({ message: "Express server started", port });
});
