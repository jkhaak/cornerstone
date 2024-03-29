import _ from "lodash";

import * as ruuviService from "../service/ruuvi";
import { db } from "../service/database";

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

const exampleEventBuffer = Buffer.from(JSON.stringify(exampleEvent), "utf-8");

function initEvent(obj: object): Buffer {
  return Buffer.from(JSON.stringify(_.merge(exampleEvent, obj)), "utf-8");
}

afterAll(async () => {
  await db.$pool.end();
});

describe("ruuvi-service", () => {
  afterEach(async () => {
    await db.none("TRUNCATE ruuvitag, ruuvidata RESTART IDENTITY;");
  });

  it("should decode an event", async () => {
    const event = ruuviService.decodeEvent(exampleEventBuffer);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    expect(event).toMatchObject({ tagId: exampleEvent.mac.slice(-4), date: expect.any(Date) });
  });

  it.each`
    macs                                                | expectedLength
    ${["F897846A37E6"]}                                 | ${1}
    ${["F897846A37E6", "F897DEADBEEF"]}                 | ${2}
    ${["F897846A37E6", "F897DEADBEEF", "F897846A37E6"]} | ${2}
  `("should fetch all tags from database", async (props: { macs: string[]; expectedLength: number }) => {
    const { macs, expectedLength } = props;

    await Promise.all(
      macs.map(async (mac) => {
        const event = initEvent({ mac });
        await ruuviService.storeEvent(event);
      })
    );

    const tags = await db.manyOrNone("SELECT * FROM ruuvitag;");
    expect(tags).toHaveLength(expectedLength);
  });

  it("should store an event to database", async () => {
    await ruuviService.storeEvent(exampleEventBuffer);

    const events = await db.manyOrNone("SELECT * FROM ruuvidata;");

    expect(events).toHaveLength(1);
    const expected = _(exampleEvent)
      .omit(["acceleration", "power", "mac", "manufacturerId"])
      .mapKeys((__, k) => _.snakeCase(k))
      .value();
    expect(events[0]).toMatchObject(expected);
  });
});
