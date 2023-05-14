import express from "express";
import * as service from "./service";
import pinoHttp from "pino-http";
import type { RawEvent } from "./model";

const app = express();
app.use(express.json());
app.use(pinoHttp());

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

app.post("/ruuvi/event", (req, res, next) => {
  service
    .saveEvent(req.body as RawEvent)
    .then(() => res.sendStatus(200))
    .catch(next);
});

export default app;
