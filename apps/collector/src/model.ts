import type { CamelToSnakeKeys } from "@cornerstone/typing-tools";
import { ruuvi } from "@cornerstone/ruuvi-parser";
import { z } from "zod";
import type { DataFormat5 } from "@cornerstone/ruuvi-parser";

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

export const manufacturerDataBase64Schema = z.object({
  manufacturerDataBase64: z.string(),
});

export const eventSchema = z.object({
  id: z.string(),
  datetime: z.string().datetime(),
  manufacturerDataHex: z.string(),
  data: dataFormat5Schema,
});

export type Event = z.infer<typeof eventSchema>;

export const apiEventSchema = eventSchema.or(manufacturerDataBase64Schema);

export async function createDataEvent(apiEvent: APIEvent): Promise<DataEvent> {
  if ("manufacturerDataBase64" in apiEvent) {
    const buffer = Buffer.from(apiEvent.manufacturerDataBase64, "base64");
    const data = await ruuvi.parseAsync(buffer);
    return {
      type: "data",
      data,
    };
  }

  return {
    type: "dataEvent",
    event: {
      ...apiEvent,
      data: apiEvent.data,
      ruuviId: parseRuuviId(apiEvent.data.mac),
    },
  };
}

export type RuuviEvent = Event & { ruuviId: RuuviId; data: DataFormat5 };

export type APIEvent = z.infer<typeof apiEventSchema>;
export type DataEvent =
  | {
      type: "dataEvent";
      event: RuuviEvent;
    }
  | { data: DataFormat5; type: "data" };

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
