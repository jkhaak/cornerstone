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

export type DecodedFormat = {
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

type Specification<Obj> = {
  [Key in keyof Obj]: (b: Buffer) => Obj[Key];
};

const specification: Specification<DecodedFormat> = {
  manufacturerId: () => "0499",
  version: () => 5,
  temperature: (b) => decodeTemperature(b, 3),
  humidity: (b) => decodeHumidity(b, 5),
  pressure: (b) => decodePressure(b, 7),
  acceleration: (b) => ({
    x: decodeAcceleration(b, 9),
    y: decodeAcceleration(b, 11),
    z: decodeAcceleration(b, 13),
  }),
  power: (b) => decodePower(b, 15),
  movementCounter: (b) => decodeMovementCounter(b, 17),
  measurementSequence: (b) => decodeMeasurementSequenceNumber(b, 18),
  mac: decodeMac,
} satisfies Specification<DecodedFormat>;

const decodeSpec = Object.entries(specification);

export function decodeTemperature(input: Buffer, offset: number = 0): Temperature {
  const num = input.readInt16BE(offset) / 200.0;
  return -163.84 < num && num < 163.84 ? num : NaN;
}

export function decodeHumidity(input: Buffer, offset: number = 0): Humidity {
  const num = input.readUInt16BE(offset) / 400.0;
  return 0 <= num && num <= 163.835 ? num : NaN;
}

export function decodePressure(input: Buffer, offset: number = 0): Pressure {
  const num = input.readUInt16BE(offset) + 50_000;
  return num < 115_535 ? num : NaN;
}

export function decodeAcceleration(input: Buffer, offset: number = 0): AccelerationValue {
  const num = input.readInt16BE(offset);
  return -32768 < num && num <= 32767 ? num / 1000.0 : NaN;
}

export function decodeMovementCounter(input: Buffer, offset: number = 0): MovementCounter {
  const num = input.readUInt8(offset);
  return num < 255 ? num : NaN;
}

export function decodePower(input: Buffer, offset: number = 0): Power {
  const leftByte = input[offset];
  const rightByte = input[offset + 1];

  if (leftByte === undefined || rightByte === undefined) {
    throw new Error("method=data-format-5.decodePower msg=input buffer out of range");
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

export function decodeMeasurementSequenceNumber(input: Buffer, offset: number = 0): MeasurementSequence {
  const num = input.readUInt16BE(offset);
  return num < 65535 ? num : NaN;
}

export function decode(input: Buffer): RuuviData {
  const dataEntries = decodeSpec.map(([key, fn]) => [key, fn(input)]);
  return Object.fromEntries(dataEntries) as RuuviData;
}

function decodeMac(buffer: Buffer): MACAddress | undefined {
  const mac = buffer.toString("hex").slice(40).toUpperCase();
  return /^F{12}$/.test(mac) ? undefined : mac;
}
