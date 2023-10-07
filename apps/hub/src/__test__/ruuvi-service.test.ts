import _ from "lodash";

import { RuuviData, ruuvi } from "@cornerstone/ruuvi-parser";
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

function initEvent(obj: object): RuuviData {
  return _.merge(exampleEvent, obj) as RuuviData;
}

describe("ruuvi-service", () => {
  afterEach(async () => {
    await db.none("TRUNCATE ruuvitag, ruuvidata RESTART IDENTITY;");
  });

  it("should decode an event", async () => {
    const event = await ruuviService.decodeEvent(exampleEventBuffer);
    expect(event).toMatchObject({ tagId: exampleEvent.mac.slice(-4) });
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
        await ruuviService.storeEvent(ruuvi.encode(event));
      })
    );

    const tags = await ruuviService.fetchTags();
    expect(tags).toHaveLength(expectedLength);
  });

  it("should store an event to database", async () => {
    await ruuviService.storeEvent(exampleEventBuffer);
  });
});
