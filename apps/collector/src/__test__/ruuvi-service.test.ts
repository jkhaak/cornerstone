import { Event, DataEvent, parseRuuviId, RuuviId } from "../model";
import type { DataFormat5 } from "@cornerstone/ruuvi-parser";
import * as service from "../service";
import { teardownTestConnection, truncateTables } from "./test-utils";
import _ from "lodash/fp";

function fromOldEventToDataEvent(event: Event, ruuviId?: RuuviId): DataEvent {
  const thatRuuviId = ruuviId === undefined ? parseRuuviId(event.data.mac) : ruuviId;
  return {
    type: "dataEvent",
    event: {
      ...event,
      ruuviId: thatRuuviId,
    },
  };
}

export const rawData = {
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

export const rawEvent = {
  id: "db7a25194f70",
  datetime: "2023-05-04T17:07:32.108Z",
  manufacturerDataHex: "99040510812c1acdb00378fdfcffd4b0b686573fdb7a25194f70",
  data: rawData,
} satisfies Event;

export const ruuviTables = ["ruuvidata", "ruuvitag"];

afterAll(() => {
  teardownTestConnection();
});

describe("service", () => {
  beforeEach(async () => {
    await truncateTables(ruuviTables);
  });

  afterAll(async () => {
    await truncateTables(ruuviTables);
  });

  it("should return empty array if no tags are found", async () => {
    const emptyArray = await service.getTags();
    expect(emptyArray).toStrictEqual([]);
  });

  it("should be able to retrieve new ruuvi tags from database after discovering new events", async () => {
    await service.saveEvent(fromOldEventToDataEvent(rawEvent, "DEAD"));
    await service.saveEvent(fromOldEventToDataEvent(rawEvent, "BEEF"));
    const result = await service.getTags();
    const ids = result.map((r) => r.id);

    expect(ids).toContain("DEAD");
    expect(ids).toContain("BEEF");
  });

  it("should create only one ruuvi tag during discovery", async () => {
    const expectedId = "DEAD";
    await service.saveEvent(fromOldEventToDataEvent(rawEvent, expectedId));
    await service.saveEvent(fromOldEventToDataEvent(rawEvent, expectedId));
    const result = await service.getTags();
    expect(result.length).toBe(1);
    const tag = result[0];

    if (tag === undefined) {
      expect(tag).not.toBeUndefined();
      return;
    }

    const id = tag.id;

    expect(id).toBe("DEAD");
  });

  it("should be able to retrieve events from database", async () => {
    const id = "BEEF";
    const testData = _.omit(["measurementSequence"], rawData);

    await service.saveEvent(
      fromOldEventToDataEvent(
        {
          ...rawEvent,
          data: { ...testData, measurementSequence: 1 },
        },
        id
      )
    );
    await service.saveEvent(
      fromOldEventToDataEvent(
        {
          ...rawEvent,
          data: { ...testData, measurementSequence: 2 },
        },
        id
      )
    );
    const result = await service.getEvents(id);

    expect(result[0]).toMatchObject(_.omit(["mac", "manufacturerId"], testData));
    expect(result[0]?.measurementSequence).toBe(1);
    expect(result[1]?.measurementSequence).toBe(2);
  });
});
