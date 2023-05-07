import { db } from "../database";
import * as service from "../service";

const rawEvent = {
  id: "db7a25194f70",
  datetime: "2023-05-04T17:07:32.108Z",
  manufacturerDataHex: "99040510812c1acdb00378fdfcffd4b0b686573fdb7a25194f70",
  data: {
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
  },
};

const expectedEvent = {};

function truncateTables() {
  return db.none(`truncate ruuvidata, ruuvitag;`);
}

describe("service", () => {
  afterEach(async () => {
    await truncateTables();
  });

  it("should store event in the database", async () => {
    const ruuviId = await service.saveEvent(rawEvent);
    const result = service.getEvent(ruuviId);

    expect(result).toMatchObject(expectedEvent);
  });
});
