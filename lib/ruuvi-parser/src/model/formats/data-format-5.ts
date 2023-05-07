import _ from "lodash";
import type {
  Acceleration,
  AccelerationValue,
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
  humidity: (b) => parseHumidity(b, 5),
  pressure: (b) => parsePressure(b, 7),
  acceleration: (b) => ({
    x: parseAcceleration(b, 9),
    y: parseAcceleration(b, 11),
    z: parseAcceleration(b, 13),
  }),
  power: (b) => parsePower(b, 15),
  movementCounter: (b) => parseMovementCounter(b, 17),
  measurementSequence: (b) => parseMeasurementSequenceNumber(b, 18),
  mac: parseMac,
} satisfies Specification<Format>;

const spec = Object.entries(specification);

export function parseTemperature(input: Buffer, offset: number = 0): Temperature {
  const num = input.readInt16BE(offset) / 200.0;
  return -163.84 < num && num < 163.84 ? num : NaN;
}

export function parseHumidity(input: Buffer, offset: number = 0): Humidity {
  const num = input.readUInt16BE(offset) / 400.0;
  return 0 <= num && num <= 163.835 ? num : NaN;
}

export function parsePressure(input: Buffer, offset: number = 0): Pressure {
  const num = input.readUInt16BE(offset) + 50_000;
  return num < 115_535 ? num : NaN;
}

export function parseAcceleration(input: Buffer, offset: number = 0): AccelerationValue {
  const num = input.readInt16BE(offset);
  return -32768 < num && num <= 32767 ? num / 1000.0 : NaN;
}

export function parseMovementCounter(input: Buffer, offset: number = 0): MovementCounter {
  const num = input.readUInt8(offset);
  return num < 255 ? num : NaN;
}

export function parsePower(input: Buffer, offset: number = 0): Power {
  const leftByte = input[offset];
  const rightByte = input[offset + 1];

  if (leftByte === undefined || rightByte === undefined) {
    throw new Error("method=data-format-5.parsePower msg=input buffer out of range");
  }

  // eslint-disable-next-line no-bitwise
  const info = (leftByte << 8) | rightByte;
  const voltage = _.floor((info >>> 5) / 1000 + 1.6, 3);
  // eslint-disable-next-line no-bitwise
  const tx = (rightByte & 0b11111) * 2 - 40;

  return {
    voltage: voltage <= 3.646 ? voltage : NaN,
    tx: tx < 22 ? tx : NaN,
  };
}

export function parseMeasurementSequenceNumber(input: Buffer, offset: number = 0): MeasurementSequence {
  const num = input.readUInt16BE(offset);
  return num < 65535 ? num : NaN;
}

export function parse(input: Buffer): RuuviData {
  const dataEntries = spec.map(([key, fn]) => [key, fn(input)]);
  return Object.fromEntries(dataEntries) as RuuviData;
}

function parseMac(buffer: Buffer): MACAddress | undefined {
  const mac = buffer.toString("hex").slice(40).toUpperCase();
  return /^F{12}$/.test(mac) ? undefined : mac;
}
