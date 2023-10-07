import { ruuvi } from "@cornerstone/ruuvi-parser";
import * as ruuviService from "../service/ruuvi.js";
import { db } from "../service/database.js";

const exampleEvent = {
  manufacturerId: "0499",
  version: 5,
  temperature: 7.405,
  humidity: 91.018,
  pressure: 98411,
  acceleration: {
    x: -0.728,
    y: -0.7,
    z: 0.004,
  },
  power: {
    voltage: 2.665,
    tx: 4,
  },
  movementCounter: 3,
  measurementSequence: 51595,
  mac: "F897846A37E6",
} as const;

const exampleEventBuffer = ruuvi.encode(exampleEvent);

describe("ruuvi-service", () => {
  afterEach(async () => {
    await db.none("TRUNCATE ruuvitag, ruuvidata RESTART IDENTITY;");
  });

  it("should decode an event", async () => {
    const event = await ruuviService.decodeEvent(exampleEventBuffer);
    expect(event).toMatchObject({ tagId: exampleEvent.mac.slice(-4) });
  });

  it("should store an event to database", async () => {
    await ruuviService.storeEvent(exampleEventBuffer);
  });
});
