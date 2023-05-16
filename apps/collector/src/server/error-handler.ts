import { fromZodError } from "zod-validation-error";
import { z } from "zod";
import type { NextFunction, Request, Response } from "express";

export function zodErrorHandler(err: unknown, __req: Request, res: Response, next: NextFunction) {
  if (err instanceof z.ZodError) {
    const prettyError = fromZodError(err);
    res.status(400).send({ errorMessage: prettyError.toString(), issues: err.issues });
  } else {
    next(err);
  }
}
