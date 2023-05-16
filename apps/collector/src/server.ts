import express, { NextFunction, Request, RequestHandler, Response } from "express";
import type * as core from "express-serve-static-core";
import * as service from "./service";
import { logger, pinoHttp } from "./logger";
import { createDataEvent, apiEventSchema, DataEvent } from "./model";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { identity } from "lodash";
import { Cache, CacheClass } from "memory-cache";
import { createHash } from "crypto";
import _ from "lodash";

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

type Transform<A, B> = (a: A) => B;

function validateBody<TInputBody, TOutputBody>(
  schema: z.Schema<TInputBody>,
  transform?: Transform<TInputBody, TOutputBody>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): RequestHandler<core.ParamsDictionary, any, TOutputBody, any> {
  return (req: Request, __res: Response, next: NextFunction) => {
    const transformFn = transform === undefined ? identity : transform;
    const validation = schema.safeParse(req.body);

    if (validation.success) {
      req.body = transformFn(validation.data);
      next();
    } else {
      next(validation.error);
    }
  };
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/naming-convention
interface AugmentedResponse<ResBody> extends Response<ResBody, core.Locals> {
  oldSend?: (body: ResBody) => this;
  oldJson?: (body: ResBody) => this;
}

type CacheItem<T> = {
  body: T;
  contentType: string | undefined;
};

function cacheWithBody<TBody, ResBody, Locals>(
  memoryCache: CacheClass<string, CacheItem<ResBody>>,
  fn: (t: TBody) => string,
  statusWithCacheResult: number,
  time: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): RequestHandler<core.ParamsDictionary, ResBody, TBody, Locals> {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req: Request<core.ParamsDictionary, any, TBody, any>,
    res: AugmentedResponse<ResBody>,
    next: NextFunction
  ) => {
    const key = fn(req.body);
    const cacheItem = memoryCache.get(key);

    if (cacheItem) {
      logger.debug({ message: "used cached item", key, cacheItem });
      res.status(statusWithCacheResult);
      if (cacheItem.contentType) {
        res.set("Content-type", cacheItem.contentType);
      }
      res.send(cacheItem.body);
    } else {
      logger.debug({ message: "no item in the cache", key });
      res.oldSend = res.send;
      res.send = (body?: ResBody) => {
        if (res.oldSend === undefined) {
          next(new Error("oldJson should have been set before"));
          return res;
        }
        if (body) {
          memoryCache.put(key, { body, contentType: res.get("Content-type") }, time);
          logger.debug({ message: "caching item", key, cacheItem: body });
          res.oldSend(body);
        } else {
          logger.debug({ message: "caching function used withouth anything to cache" });
          next(new Error("nothing to save in the cache"));
        }
        return res;
      };
      next();
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

function getHex(event: DataEvent) {
  const hash = createHash("sha256");
  const { data } = event;

  const paths = [
    "manufacturerId",
    "version",
    "temperature",
    "humidity",
    "pressure",
    "acceleration.x",
    "acceleration.y",
    "acceleration.z",
    "power.voltage",
    "power.tx",
    "movementCounter",
    "measurementSequence",
    "mac",
  ] as const;

  for (const path of paths) {
    const item: unknown = _.get(data, path);

    if (typeof item === "string") {
      hash.update(item);
    } else if (typeof item === "number") {
      hash.update(item.toString());
    }
  }

  return hash.digest("hex");
}

app.post(
  "/ruuvi/event",
  validateBody(apiEventSchema, createDataEvent),
  cacheWithBody(new Cache(), getHex, 200, 30),
  (req, res, next) => {
    const event = req.body;

    service
      .saveEvent(event)
      .then((id) => res.status(201).json({ id }))
      .catch(next);
  }
);

// Error handlers
app.use(zodErrorHandler);

export default app;
