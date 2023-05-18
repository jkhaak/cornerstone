import request from "supertest";
import app from "../server";

import * as service from "../service";

import { rawData, rawEvent, ruuviTables } from "./ruuvi-service.test";
import { getHeaders, teardownTestConnection, truncateTables } from "./test-utils";
import _ from "lodash";
import type { RuuviData, RuuviId } from "../model";

function compareNumbers(a: number, b: number) {
  return a - b;
}

afterAll(() => {
  teardownTestConnection();
});

describe("rest api", () => {
  describe("get endpoints", () => {
    const ids = ["DEAD", "BEEF", "DADA"] as RuuviId[];
    const sequenceStart = _.random(20, 150);
    const measurementSequences = _.range(sequenceStart, sequenceStart + _.random(2, 7));

    beforeAll(async () => {
      await truncateTables(ruuviTables);

      await Promise.allSettled(
        ids.flatMap((id) =>
          measurementSequences.map((measurementSequence) =>
            service.saveEvent({
              ...rawEvent,
              ruuviId: id,
              data: { ...rawData, measurementSequence },
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
      const responseMeasurementSequences = responseEvents.map((event) => event.measurementSequence);
      responseMeasurementSequences.sort(compareNumbers);

      expect(responseMeasurementSequences).toMatchObject(measurementSequences);
    });

    it("should fail fetching events if requested with an unknown ruuvi id", async () => {
      const incorrectId = "TRSH";

      const response = await request(app).get(`/ruuvi/${incorrectId}/events`);
      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({ error: `Couldn't find events with id ${incorrectId}` });
    });
  });

  describe("post endpoints", () => {
    afterEach(async () => {
      await truncateTables(ruuviTables);
    });

    it("should return resource id with created status", async () => {
      const id = "DEAF";
      const response = await request(app)
        .post("/ruuvi/event")
        .send({ ...rawEvent, data: { ...rawData, mac: `DEADBEEF${id}` } });
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({ id });
    });

    it("should consume ruuvi events", async () => {
      const ruuviId = "DEFA";
      const payload = { ...rawEvent, ruuviId, data: { ...rawData, mac: `DEADBEEF${ruuviId}` } };
      const response = await request(app).post("/ruuvi/event").send(payload);
      expect(response.status).toBe(201);

      const events = await service.getEvents(ruuviId);
      expect(events.length).toBe(1);
    });

    it("should prevent duplicate events", async () => {
      const firstPostResponse = await request(app)
        .post("/ruuvi/event")
        .send({ ...rawEvent, datetime: new Date() });
      expect(firstPostResponse.status).toBe(201);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { id }: { id: RuuviId } = firstPostResponse.body;

      const secondPostResponse = await request(app)
        .post("/ruuvi/event")
        .send({ ...rawEvent, datetime: new Date() });
      expect(secondPostResponse.status).toBe(200);
      expect(secondPostResponse.body).toMatchObject({ id });

      const events = await service.getEvents(id);
      expect(events.length).toBe(1);
    });

    it("should consume multiple events (if they differ enough)", async () => {
      const firstPostResponse = await request(app)
        .post("/ruuvi/event")
        .send({ ...rawEvent, datetime: new Date(), data: { ...rawData, temperature: 24 } });
      expect(firstPostResponse.status).toBe(201);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { id }: { id: RuuviId } = firstPostResponse.body;

      const secondPostResponse = await request(app)
        .post("/ruuvi/event")
        .send({ ...rawEvent, datetime: new Date(), data: { ...rawData, temperature: 25 } });
      expect(secondPostResponse.status).toBe(201);
      expect(secondPostResponse.body).toMatchObject({ id });

      const events = await service.getEvents(id);
      expect(events.length).toBe(2);
    });

    it("should fail with invalid event", () => {
      const invalidEvents = [
        {},
        { id: "DADA", datetime: new Date(), manufacturerDataHex: "123456789ABCDEF", data: {} },
        {
          id: "DADA",
          datetime: new Date(),
          manufacturerDataHex: "123456789ABCDEF",
          data: {
            manufacturerId: "449",
            version: 5,
            power: { tx: 5 },
          },
        },
      ];

      const expectedObject = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        errorMessage: expect.stringMatching(/Validation error/),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        issues: expect.anything(),
      };

      return Promise.all(
        invalidEvents.map(async (invalidEvent) => {
          const response = await request(app).post("/ruuvi/event").send(invalidEvent);
          expect(response.status).toBe(400);

          expect(response.body).toMatchObject(expectedObject);
          expect(response.body).toMatchSnapshot();
        })
      );
    });
  });
});
