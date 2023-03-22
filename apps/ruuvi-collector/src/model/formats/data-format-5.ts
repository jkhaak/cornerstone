import type { AccelerationValue, DataFormatVersion, RuuviData } from "./ruuvi-data-types";

import type {
  RuuviManufacturerId,
  Temperature,
  Humidity,
  Pressure,
  Acceleration,
  Power,
  MovementCounter,
  MeasurementSequence,
  MACAddress,
} from "./ruuvi-data-types";

export type Format = {
  manufacturerId: RuuviManufacturerId;
  version: DataFormatVersion;
  temperature: Temperature;
  humidity: Humidity;
  pressure: Pressure;
  acceleration: Acceleration;
  power: Power;
  movementCounter: MovementCounter;
  measurementSequence: MeasurementSequence;
  mac: MACAddress;
};

export function parseTemperature(input: Buffer, offset: number = 0): Temperature {
  const num = input.readInt16BE(offset) / 200.0;
  return -163.84 < num && num < 163.84 ? num : NaN;
}

export function parseHumidity(input: Buffer, offset: number = 0): Humidity {
  const num = input.readUInt16BE(offset) / 400.0;
  return 0 <= num && num <= 100 ? num : NaN;
}

export function parsePressure(input: Buffer, offset: number = 0): Pressure {
  const num = input.readUInt16BE(offset) + 50_000;
  return num < 115_535 ? num : NaN;
}

export function parseAcceleration(input: Buffer, offset: number = 0): AccelerationValue {
  const num = input.readInt16BE(offset);
  return -32768 < num && num < 32767 ? num : NaN;
}

export function parseMovementCounter(input: Buffer, offset: number = 0): MovementCounter {
  const num = input.readUInt8(offset);
  return num < 255 ? num : NaN;
}

export function parse(input: Buffer): RuuviData {
  return {
    manufacturerId: "499",
    version: 5,
    temperature: 0,
    humidity: 0,
    pressure: 0,
    acceleration: { x: 0, y: 0, z: 0 },
    power: {
      voltage: 0,
      tx: 0,
    },
    movementCounter: 0,
    measurementSequence: 0,
    mac: "",
  };
}
