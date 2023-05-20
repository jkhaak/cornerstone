import express from "express";
import { createHash } from "crypto";
import * as service from "../service";
import { RuuviEvent, apiEventSchema, createDataEvent } from "../model";
import { cacheWithBody, validateBody } from "../server/middleware";
import _ from "lodash";
import { cacheManager } from "../cache-manager";
import type { DecodedFormat5 } from "@cornerstone/ruuvi-parser";

const router = express.Router();

function createCacheKey(event: RuuviEvent) {
  const hash = createHash("sha256");
  const { data }: { data: DecodedFormat5 } = event;

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

router.get("/tags", (__req, res, next) => {
  service
    .getTags()
    .then((tags) => res.send(tags.map((tag) => tag.id)))
    .catch(next);
});

router.get("/:id/events", (req, res, next) => {
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

router.post(
  "/event",
  validateBody(apiEventSchema, createDataEvent),
  cacheWithBody(cacheManager.createCache("ruuvi-post-event"), createCacheKey, 200, 60),
  (req, res, next) => {
    const event = req.body;

    service
      .saveEvent(event)
      .then((id) => res.status(201).json({ id }))
      .catch(next);
  }
);

export default router;
