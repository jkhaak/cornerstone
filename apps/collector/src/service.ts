import { db } from "./database";
import type { RuuviId } from "./model";

const SQL_INSERT_RUUVITAG = `
INSERT INTO ruuvitag
(id, mac)
VALUES($1, $2)
RETURNING id;
`;

const SQL_INSERT_RUUVIEVENT = `
INSERT INTO public.ruuvidata
(ruuvitag, "version", datetime, temperature, humidity, pressure, acceleration_x, acceleration_y, acceleration_z, power_voltage, power_tx, movement_counter, measurement_counter)
VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
`;

export async function saveEvent(event: unknown): Promise<RuuviId> {
  return `1234`;
}

export async function getEvent(id: RuuviId) {
  return {};
}
