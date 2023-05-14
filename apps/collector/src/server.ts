import express from "express";
import * as service from "./service";
import pinoHttp from "pino-http";

const app = express();
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
    .then((events) => res.send(events))
    .catch(next);
});

export default app;
