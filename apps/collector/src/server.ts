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

export default app;
