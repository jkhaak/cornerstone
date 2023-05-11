import type { DataFormat5 } from "@cornerstone/ruuvi-parser";
import type { CamelToSnakeKeys, NonNullableObj } from "@cornerstone/typing-tools";

export type RuuviId = `${Uppercase<string>}`;

export type RawEvent = {
  id: string;
  datetime: string;
  manufacturerDataHex: string;
  data: NonNullableObj<DataFormat5>;
};

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
