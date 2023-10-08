import { RuuviData, ruuvi } from "@cornerstone/ruuvi-parser";
import { db } from "./database";
import { PreparedStatement as PS } from "pg-promise";

const SQL_INSERT_RUUVITAG = new PS({
  name: "insert-ruuvitag",
  text: `INSERT INTO ruuvitag (id, mac) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
});

const SQL_SELECT_RUUVITAGS = new PS({
  name: "select-ruuvitags",
  text: `SELECT id, mac FROM ruuvitag;`,
});

const SQL_INSERT_RUUVIEVENT = new PS({
  name: "insert-ruuvievent",
  text: `
    INSERT INTO ruuvidata
    (id, ruuvitag, "version", datetime, temperature, humidity, pressure, acceleration_x, acceleration_y, acceleration_z, power_voltage, power_tx, movement_counter, measurement_sequence)
    VALUES(nextval('ruuvidata_id_seq':: regclass), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);`,
});

type RuuviEventDto = Readonly<
  RuuviData & {
    tagId: string;
    date: Date;
  }
>;

type RuuviTag = {
  tagId: string;
  mac: string;
};

export async function decodeEvent(eventBuffer: Buffer): Promise<RuuviEventDto> {
  const event = await ruuvi.decodeAsync(eventBuffer);

  return {
    ...event,
    tagId: event.mac.slice(-4),
    date: new Date(),
  };
}

export async function fetchTags(): Promise<RuuviTag[]> {
  return db.manyOrNone(SQL_SELECT_RUUVITAGS);
}

export async function storeEvent(eventBuffer: Buffer) {
  const {
    tagId,
    version,
    date,
    temperature,
    humidity,
    pressure,
    acceleration,
    power,
    movementCounter,
    measurementSequence,
    mac,
  } = await decodeEvent(eventBuffer);

  await db.tx(async (t) => {
    await t.none(SQL_INSERT_RUUVITAG, [tagId, mac]);
    await t.none(SQL_INSERT_RUUVIEVENT, [
      tagId,
      version,
      date,
      temperature,
      humidity,
      pressure,
      acceleration.x,
      acceleration.y,
      acceleration.z,
      power.voltage,
      power.tx,
      movementCounter,
      measurementSequence,
    ]);
  });
}
