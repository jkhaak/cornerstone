import request from "supertest";
import app from "../server";

import * as service from "../service";

import { rawData, rawEvent, ruuviTables } from "./ruuvi-service.test";
import { getHeaders, truncateTables } from "./test-utils";

describe("rest api", () => {
  describe("get endpoints for ruuvi service", () => {
    const ids = ["DEAD", "BEEF", "DADA"];

    beforeAll(async () => {
      await truncateTables(ruuviTables);

      await Promise.allSettled(
        ids.map((id) => service.saveEvent({ ...rawEvent, data: { ...rawData, mac: `12345678${id}` } }))
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
  });
});
