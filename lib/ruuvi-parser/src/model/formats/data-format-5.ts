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

function decodeMac(buffer: Buffer): MACAddress {
  const mac = buffer.toString("hex").slice(40).toUpperCase();
  return mac;
}

type EncodeFunction = (data: DecodedFormat, buffer: Buffer) => Buffer;

function encodeManufacturerId(offset: number = 0): EncodeFunction {
  return ({ manufacturerId }, buffer) => {
    const num = parseInt(manufacturerId, 16);
    buffer.writeInt16LE(num, offset);
    return buffer;
  };
}

function encodeVersion(offset: number = 0): EncodeFunction {
  return ({ version }, buffer) => {
    buffer.writeInt8(version, offset);
    return buffer;
  };
}

function encodeTemperature(offset: number = 0): EncodeFunction {
  return ({ temperature }, buffer) => {
    buffer.writeInt16BE(temperature * 200, offset);
    return buffer;
  };
}

function encodeHumidity(offset: number = 0): EncodeFunction {
  return ({ humidity }, buffer) => {
    buffer.writeUInt16BE(humidity * 400, offset);
    return buffer;
  };
}

function encodePressure(offset: number = 0): EncodeFunction {
  return ({ pressure }, buffer) => {
    buffer.writeUInt16BE(pressure - 50_000, offset);
    return buffer;
  };
}

function encodeAcceleration(offset: number = 0): EncodeFunction {
  return ({ acceleration }, buffer) => {
    buffer.writeInt16BE(_.round(acceleration.x * 1000.0), offset);
    buffer.writeInt16BE(_.round(acceleration.y * 1000.0), offset + 2);
    buffer.writeInt16BE(_.round(acceleration.z * 1000.0), offset + 4);
    return buffer;
  };
}

function encodePower(offset: number = 0): EncodeFunction {
  return ({ power }, buffer) => {
    const voltage = _.ceil((power.voltage - 1.6) * 1000);
    const tx = (power.tx + 40) / 2;
    // eslint-disable-next-line no-bitwise
    const data = (voltage << 5) | (tx & 0b11111);

    buffer.writeUInt16BE(data, offset);
    return buffer;
  };
}

function encodeMovementCounter(offset: number = 0): EncodeFunction {
  return ({ movementCounter }, buffer) => {
    buffer.writeUInt8(movementCounter, offset);
    return buffer;
  };
}

function encodeMeasurementSequence(offset: number = 0): EncodeFunction {
  return ({ measurementSequence }, buffer) => {
    buffer.writeUInt16BE(measurementSequence, offset);
    return buffer;
  };
}

function encodeMac(offset: number = 0): EncodeFunction {
  return ({ mac }, buffer) => {
    for (let i = 0, j = 0; i < 12; i += 2, j++) {
      const digits = mac.slice(i, i + 2);
      const num = parseInt(digits, 16);
      buffer.writeUInt8(num, offset + j);
    }
    return buffer;
  };
}

const encodeFns: EncodeFunction[] = [
  encodeManufacturerId(0),
  encodeVersion(2),
  encodeTemperature(3),
  encodeHumidity(5),
  encodePressure(7),
  encodeAcceleration(9),
  encodePower(15),
  encodeMovementCounter(17),
  encodeMeasurementSequence(18),
  encodeMac(20),
];

export function encode(data: DecodedFormat): Buffer {
  const buffer = Buffer.alloc(26);
  return encodeFns.reduce((buf, fn) => fn(data, buf), buffer);
}
