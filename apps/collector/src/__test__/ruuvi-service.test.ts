import type { RawEvent } from "../model";
import type { DataFormat5 } from "@cornerstone/ruuvi-parser";
import * as service from "../service";
import { truncateTables } from "./test-utils";

const rawData = {
  manufacturerId: "499",
  version: 5,
  temperature: 21.125,
  humidity: 28.225,
  pressure: 102656,
  acceleration: {
    x: 0.888,
    y: -0.516,
    z: -0.044,
  },
  power: {
    voltage: 3.013,
    tx: 4,
  },
  movementCounter: 134,
  measurementSequence: 22335,
  mac: "DB7A25194F70",
} satisfies DataFormat5;

const rawEvent = {
  id: "db7a25194f70",
  datetime: "2023-05-04T17:07:32.108Z",
  manufacturerDataHex: "99040510812c1acdb00378fdfcffd4b0b686573fdb7a25194f70",
  data: rawData,
} satisfies RawEvent;

describe("service", () => {
  afterEach(async () => {
    await truncateTables(["ruuvidata", "ruuvitag"]);
  });

  it("should be able to retrieve new ruuvi tags from database after discovering new events", async () => {
    await service.saveEvent({ ...rawEvent, data: { ...rawData, mac: "1234BEEFDEAD" } });
    await service.saveEvent({ ...rawEvent, data: { ...rawData, mac: "1234DEADBEEF" } });
    const result = await service.getTags();
    const ids = result.map((r) => r.id);

    expect(ids).toContain("DEAD");
    expect(ids).toContain("BEEF");
  });
});
