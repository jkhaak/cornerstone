import express, { NextFunction, Request, RequestHandler, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import * as service from "./service";
import { pinoHttp } from "./logger";
import { eventSchema } from "./model";
import type { Event } from "./model";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

function zodErrorHandler(err: unknown, __req: Request, res: Response, next: NextFunction) {
  if (err instanceof z.ZodError) {
    const prettyError = fromZodError(err);
    res.status(400).send({ errorMessage: prettyError.toString(), issues: err.issues });
  } else {
    next(err);
  }
}

const app = express();
app.use(express.json());
app.use(pinoHttp);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateBody<TBody>(schema: z.Schema<TBody>): RequestHandler<ParamsDictionary, any, TBody, any> {
  return (req: Request, __res: Response, next: NextFunction) => {
    const validation = schema.safeParse(req.body);

    if (validation.success) {
      req.body = validation.data;
      next();
    } else {
      next(validation.error);
    }
  };
}

app.get("/ruuvi/tags", (__req, res, next) => {
  service
    .getTags()
    .then((tags) => res.send(tags.map((tag) => tag.id)))
    .catch(next);
});

app.get("/ruuvi/:id/events", (req, res, next) => {
  const id = req.params.id.toUpperCase() as Uppercase<string>;

  service
    .getEvents(id)
    .then((events) => {
      if (events.length === 0) {
        return res.status(404).send({ error: `Couldn't find events with id ${id}` });
      }
      return res.send(events);
    })
    .catch(next);
});

app.post("/ruuvi/event", validateBody(eventSchema), (req, res, next) => {
  // zod transformation isn't working as it should in type level
  const event = req.body as Event;

  service
    .saveEvent(event)
    .then((id) => res.status(201).send({ id }))
    .catch(next);
});

// Error handlers
app.use(zodErrorHandler);

export default app;
