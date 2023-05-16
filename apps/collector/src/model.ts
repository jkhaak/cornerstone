import type { CamelToSnakeKeys } from "@cornerstone/typing-tools";
import { z } from "zod";

export type RuuviId = `${Uppercase<string>}`;

export const dataFormat5Schema = z.object({
  manufacturerId: z.literal("499"),
  version: z.literal(5),
  temperature: z.number(),
  humidity: z.number(),
  pressure: z.number(),
  acceleration: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),
  power: z.object({
    voltage: z.number(),
    tx: z.number(),
  }),
  movementCounter: z.number(),
  measurementSequence: z.number(),
  mac: z.string().transform((s) => s.toUpperCase()),
});

export const eventSchema = z
  .object({
    id: z.string(),
    datetime: z.string().datetime(),
    manufacturerDataHex: z.string(),
    data: dataFormat5Schema,
  })
  .transform((event) => ({ ...event, ruuviId: parseRuuviId(event.data.mac) }));

export type Event = z.infer<typeof eventSchema>;

export type RuuviData = {
  id: number;
  ruuvitag: RuuviId;
  version: number;
  datetime: Date;
  temperature: number;
  humidity: number;
  pressure: number;
  acceleration: {
    x: number;
    y: number;
    z: number;
  };
  power: {
    voltage: number;
    tx: number;
  };
  movementCounter: number;
  measurementSequence: number;
};

export type QueryResultRuuviData = {
  id: number;
  ruuvitag: RuuviId;
  version: number;
  datetime: Date;
  temperature: number;
  humidity: number;
  pressure: number;
  acceleration_x: number;
  acceleration_y: number;
  acceleration_z: number;
  power_voltage: number;
  power_tx: number;
  movement_counter: number;
  measurement_sequence: number;
};

export type RuuviTag = {
  id: RuuviId;
  mac: string;
  displayName: string | undefined;
};

export type QueryResultRuuviTag = CamelToSnakeKeys<RuuviTag>;

export function parseRuuviId(strId: string): RuuviId {
  const found = strId.match(/\w{4}$/);
  if (found) {
    return found[0].toUpperCase() as RuuviId;
  }

  throw new Error("Cannot parse the ruuvi id");
}

export function dtoRuuviTag(queryResult: QueryResultRuuviTag): RuuviTag {
  const { id, mac } = queryResult;

  return {
    id,
    mac,
    displayName: queryResult.display_name,
  } satisfies RuuviTag;
}

export function dtoRuuviData(queryResult: QueryResultRuuviData): RuuviData {
  const { id, ruuvitag, version, datetime, temperature, humidity, pressure } = queryResult;

  return {
    id,
    ruuvitag,
    version,
    datetime,
    temperature,
    humidity,
    pressure,
    acceleration: {
      x: queryResult.acceleration_x,
      y: queryResult.acceleration_y,
      z: queryResult.acceleration_z,
    },
    power: {
      voltage: queryResult.power_voltage,
      tx: queryResult.power_tx,
    },
    movementCounter: queryResult.movement_counter,
    measurementSequence: queryResult.measurement_sequence,
  };
}
