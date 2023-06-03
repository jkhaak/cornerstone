import { logger } from "@cornerstone/core";

export function errorHandler(context: string) {
  return (error: unknown) => {
    logger.error({ message: `unexpected error occured in '${context}'`, context, error });
  };
}
