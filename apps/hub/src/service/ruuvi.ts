import { RuuviData, ruuvi } from "@cornerstone/ruuvi-parser";
import { db } from "./database.js";
import { PreparedStatement as PS } from "pg-promise";

const SQL_INSERT_RUUVITAG = new PS({
  name: "insert-ruuvitag",
  text: `INSERT INTO ruuvitag (id, mac) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
});

const SQL_SELECT_RUUVITAGS = new PS({
  name: "select-ruuvitags",
  text: `SELECT id, mac FROM ruuvitag;`,
});

type RuuviEventDto = RuuviData & {
  tagId: string;
};

type RuuviTag = {
  tagId: string;
  mac: string;
};

export async function decodeEvent(eventBuffer: Buffer): Promise<RuuviEventDto> {
  const event = await ruuvi.decodeAsync(eventBuffer);

  return {
    ...event,
    tagId: event.mac.slice(-4),
  };
}

export async function fetchTags(): Promise<RuuviTag[]> {
  return db.manyOrNone(SQL_SELECT_RUUVITAGS);
}

export async function storeEvent(eventBuffer: Buffer) {
  const event = await decodeEvent(eventBuffer);

  await db.none(SQL_INSERT_RUUVITAG, [event.tagId, event.mac]);
}
