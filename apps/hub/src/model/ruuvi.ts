import type { CamelToSnakeKeys } from "@cornerstone/typing-tools";
import { ruuvi } from "@cornerstone/ruuvi-parser";
import { z } from "zod";
import type { DecodedFormat5 } from "@cornerstone/ruuvi-parser";

export type RuuviId = `${Uppercase<string>}`;

export const apiEventSchema = z.object({
  manufacturerDataBase64: z.string(),
});

export type RuuviEvent = { ruuviId: RuuviId; data: DecodedFormat5 };

export type APIEvent = z.infer<typeof apiEventSchema>;

export async function createDataEvent(apiEvent: APIEvent): Promise<RuuviEvent> {
  const buffer = Buffer.from(apiEvent.manufacturerDataBase64, "base64");
  const data = await ruuvi.decodeAsync(buffer);

  return { ruuviId: parseRuuviId(data.mac), data };
}

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
