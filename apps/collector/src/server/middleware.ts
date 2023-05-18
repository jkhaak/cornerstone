import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { z } from "zod";
import type { MemoryCache } from "memory-cache-node";
import type * as core from "express-serve-static-core";
import { logger } from "@cornerstone/core";

export type Transform<A, B> = (a: A) => Promise<B>;

export function validateBody<TInputBody, TOutputBody>(
  schema: z.Schema<TInputBody>,
  transform?: Transform<TInputBody, TOutputBody>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): RequestHandler<core.ParamsDictionary, any, TOutputBody, any> {
  const transformFn = transform === undefined ? <T>(val: T) => Promise.resolve(val) : transform;
  return (req: Request, __res: Response, next: NextFunction) => {
    schema
      .parseAsync(req.body)
      .then(transformFn)
      .then((val) => {
        req.body = val;
        next();
      })
      .catch(next);
  };
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/naming-convention
export interface CacheResponse<ResBody> extends Response<ResBody, core.Locals> {
  oldSend?: (body: ResBody) => this;
  oldJson?: (body: ResBody) => this;
}

export type CacheItem<T> = {
  body: T;
  contentType: string | undefined;
};

export function cacheWithBody<ReqBody, ResBody, Locals>(
  memoryCache: MemoryCache<string, CacheItem<ResBody>>,
  fn: (t: ReqBody) => string,
  statusWithCacheResult: number,
  cacheTtl: number
): RequestHandler<core.ParamsDictionary, ResBody, ReqBody, Locals> {
  return (
    req: Request<core.ParamsDictionary, ResBody, ReqBody, Locals>,
    res: CacheResponse<ResBody>,
    next: NextFunction
  ) => {
    const key = fn(req.body);
    const cacheItem = memoryCache.retrieveItemValue(key);

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
          memoryCache.storeExpiringItem(key, { body, contentType: res.get("Content-type") }, cacheTtl);
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
