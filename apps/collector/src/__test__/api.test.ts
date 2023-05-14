import request from "supertest";
import app from "../server";

import * as service from "../service";

import { rawData, rawEvent, ruuviTables } from "./ruuvi-service.test";
import { getHeaders, truncateTables } from "./test-utils";
import _ from "lodash";
import type { RuuviData } from "../model";

describe("rest api", () => {
  describe("get endpoints for ruuvi service", () => {
    const ids = ["DEAD", "BEEF", "DADA"];
    const sequenceStart = _.random(20, 150);
    const measurementSequences = _.range(sequenceStart, sequenceStart + _.random(2, 7));

    beforeAll(async () => {
      await truncateTables(ruuviTables);

      await Promise.allSettled(
        ids.flatMap((id) =>
          measurementSequences.map((measurementSequence) =>
            service.saveEvent({
              ...rawEvent,
              data: { ...rawData, measurementSequence, mac: `12345678${id}` },
            })
          )
        )
      );
    });

    afterAll(async () => {
      await truncateTables(ruuviTables);
    });

    it("should return all known ruuvi tags", async () => {
      const response = await request(app).get("/ruuvi/tags");

      const headers = getHeaders(response);

      expect(headers["content-type"]).toMatch(/json/);
      expect(response.status).toBe(200);

      const idsSorted = [...ids].sort();
      const tagIdsSorted = [...(response.body as string[])].sort();

      expect(tagIdsSorted).toMatchObject(idsSorted);
    });

    it("should return all events by ruuvi tag", async () => {
      const id = ids[_.random(ids.length - 1)];
      if (id === undefined) {
        throw new Error("Couldn't pick any id from a test set.");
      }

      const response = await request(app).get(`/ruuvi/${id}/events`);
      expect(response.status).toBe(200);

      const headers = getHeaders(response);
      expect(headers["content-type"]).toMatch(/json/);

      const responseEvents = response.body as RuuviData[];
      const responseMeasurementSequences = responseEvents.map((event) => event.measurementSequence).sort();

      expect(responseMeasurementSequences).toMatchObject(measurementSequences);
    });

    it("should fail fetching events if requested with an unknown ruuvi id", async () => {
      const incorrectId = "TRSH";

      const response = await request(app).get(`/ruuvi/${incorrectId}/events`);
      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({ error: `Couldn't find events with id ${incorrectId}` });
    });
  });
});
