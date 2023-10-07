import { RuuviData, ruuvi } from "@cornerstone/ruuvi-parser";
import { db } from "./database.js";
import { PreparedStatement as PS } from "pg-promise";

const SQL_INSERT_RUUVITAG = new PS({
  name: "insert-ruuvitag",
  text: `INSERT INTO ruuvitag (id, mac) VALUES ($1, $2);`,
});

type RuuviEventDto = RuuviData & {
  tagId: string;
};

export async function decodeEvent(eventBuffer: Buffer): Promise<RuuviEventDto> {
  const event = await ruuvi.decodeAsync(eventBuffer);

  return {
    ...event,
    tagId: event.mac.slice(-4),
  };
}

export async function storeEvent(eventBuffer: Buffer) {
  const event = await decodeEvent(eventBuffer);

  await db.none(SQL_INSERT_RUUVITAG, [event.tagId, event.mac]);
}
