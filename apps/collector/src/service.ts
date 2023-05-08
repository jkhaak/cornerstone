import { db } from "./database";
import { RuuviId, RawEvent, RuuviTag, dtoRuuviTag } from "./model";

const SQL_GET_RUUVITAGS = `
SELECT *
FROM ruuvitag;
`;

const SQL_INSERT_RUUVITAG = `
INSERT INTO ruuvitag
(id, mac)
VALUES($1, $2);
`;

const SQL_INSERT_RUUVIEVENT = `
INSERT INTO public.ruuvidata
(ruuvitag, "version", datetime, temperature, humidity, pressure, acceleration_x, acceleration_y, acceleration_z, power_voltage, power_tx, movement_counter, measurement_counter)
VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
`;

function parseId(strId: string) {
  const found = strId.match(/\w{4}$/);
  if (found) {
    return found[0];
  }

  throw new Error("Cannot parse the ruuvi id");
}

export async function saveEvent(event: RawEvent) {
  return db.none(SQL_INSERT_RUUVITAG, [parseId(event.data.mac), event.data.mac]);
}

export async function getEvent(id: RuuviId) {
  return {};
}

export async function getTags(): Promise<RuuviTag[]> {
  return db.many(SQL_GET_RUUVITAGS).then((items) => items.map(dtoRuuviTag));
}
