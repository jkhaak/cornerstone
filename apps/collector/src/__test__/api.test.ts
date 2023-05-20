import request from "supertest";
import express from "express";
import { initServer } from "../server";
import * as service from "../service";
import { ruuvi, DecodedFormat5 } from "@cornerstone/ruuvi-parser";
import { rawData, ruuviTables } from "./ruuvi-service.test";
import { getHeaders, teardownTestConnection, truncateTables } from "./test-utils";
import _ from "lodash";
import type { APIEvent, RuuviData, RuuviId } from "../model";
import { cacheManager } from "../cache-manager";

const app = express();
initServer(app);

function compareNumbers(a: number, b: number) {
  return a - b;
}

const exampleManufacturerDataHex = "99040504aa7bb6c8f4fd0cfd4800007c76b92fa5f897846a37e6";
const exampleManufacturerDataBase64 = Buffer.from(exampleManufacturerDataHex, "hex").toString("base64");

function dataToEvent(data: DecodedFormat5): APIEvent {
  return {
    manufacturerDataBase64: ruuvi.encode(data).toString("base64"),
  };
}

afterAll(() => {
  teardownTestConnection();
  cacheManager.destroyCaches();
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
            service.saveEvent({ ruuviId: id, data: { ...rawData, measurementSequence } })
          )
        )
      );
    });

    afterAll(async () => {
      await truncateTables(ruuviTables);
    });

    afterEach(() => {
      cacheManager.clearCaches();
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
      cacheManager.clearCaches();
    });

    it("should return resource id with created status", async () => {
      const id = "DEAF";
      const payload = dataToEvent({ ...rawData, mac: `DEADBEEF${id}` });
      const response = await request(app).post("/ruuvi/event").send(payload);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({ id });
    });

    it("should consume ruuvi advertisement", async () => {
      const payload = { manufacturerDataBase64: exampleManufacturerDataBase64 };
      const response = await request(app).post("/ruuvi/event").send(payload);
      expect(response.status).toBe(201);
    });

    it("should consume ruuvi events", async () => {
      const ruuviId = "DEFA";
      const payload = dataToEvent({ ...rawData, mac: `DEADBEEF${ruuviId}` });
      const response = await request(app).post("/ruuvi/event").send(payload);
      expect(response.status).toBe(201);

      const events = await service.getEvents(ruuviId);
      expect(events.length).toBe(1);
    });

    it("should prevent duplicate events", async () => {
      const payload = dataToEvent(rawData);
      const firstPostResponse = await request(app).post("/ruuvi/event").send(payload);
      expect(firstPostResponse.status).toBe(201);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { id }: { id: RuuviId } = firstPostResponse.body;

      const secondPostResponse = await request(app).post("/ruuvi/event").send(payload);
      expect(secondPostResponse.status).toBe(200);
      expect(secondPostResponse.body).toMatchObject({ id });

      const events = await service.getEvents(id);
      expect(events.length).toBe(1);
    });

    it("should consume multiple events (if they differ enough)", async () => {
      const firstPayload = dataToEvent({ ...rawData, temperature: 23 });
      const firstPostResponse = await request(app).post("/ruuvi/event").send(firstPayload);
      expect(firstPostResponse.status).toBe(201);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { id }: { id: RuuviId } = firstPostResponse.body;

      const secondPayload = dataToEvent({ ...rawData, temperature: 26 });
      const secondPostResponse = await request(app).post("/ruuvi/event").send(secondPayload);
      expect(secondPostResponse.status).toBe(201);
      expect(secondPostResponse.body).toMatchObject({ id });

      const events = await service.getEvents(id);
      expect(events.length).toBe(2);
    });

    it("should fail with invalid event", () => {
      const invalidEvents = [
        { manufacturerId: "helloworld" },
        { manufacturerDataBase64: "" },
        { manufacturerDataBase64: exampleManufacturerDataHex },
      ];

      const expectedObject = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        errorMessage: expect.stringMatching(/Validation error/),
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
