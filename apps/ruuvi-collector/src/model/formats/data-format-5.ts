import type { ValueOf } from "../utils";
import type {
  Acceleration,
  AccelerationValue,
  BatteryVoltage,
  DataFormatVersion,
  Humidity,
  MACAddress,
  MeasurementSequence,
  MovementCounter,
  Power,
  Pressure,
  RuuviData,
  RuuviManufacturerId,
  Temperature,
  TxPower,
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
  mac: MACAddress | undefined;
};

type Specification<Obj> = {
  [Key in keyof Obj]: (b: Buffer) => Obj[Key];
};

const specification: Specification<Format> = {
  manufacturerId: () => "499",
  version: () => 5,
  temperature: (b) => parseTemperature(b, 3),
  humidity: (b) => parseHumidity(b, 4),
  pressure: (b) => parsePressure(b, 6),
  acceleration: (b) => ({
    x: parseAcceleration(b, 8),
    y: parseAcceleration(b, 10),
    z: parseAcceleration(b, 12),
  }),
  power: (b) => ({
    voltage: parseBatteryVoltage(b, 14),
    tx: parseTxPower(b, 14),
  }),
  movementCounter: (b) => parseMovementCounter(b, 15),
  measurementSequence: (b) => parseMeasurementSequenceNumber(b, 17),
  mac: (b) => b.toString("hex"),
} satisfies Specification<Format>;

const spec = Object.entries(specification);

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

export function parseBatteryVoltage(input: Buffer, offset: number = 0): BatteryVoltage {
  const num = input.readUInt16BE(offset) + 1600;
  return num <= 3600 ? num : NaN;
}

export function parseTxPower(input: Buffer, offset: number = 0): TxPower {
  const num = input.readUInt8(offset) / 0.5 - 40;
  return -40 <= num && num < 22 ? num : NaN;
}

export function parseMeasurementSequenceNumber(input: Buffer, offset: number = 0): MeasurementSequence {
  const num = input.readUInt16BE(offset);
  return num < 65535 ? num : NaN;
}

export function parse(input: Buffer): RuuviData {
  const dataEntries = spec.map(([key, fn]) => [key, fn(input)]);
  return Object.fromEntries(dataEntries);
}
