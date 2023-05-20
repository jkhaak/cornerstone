import * as DataFormat5 from "../model/formats/data-format-5";
import type { DecodedFormat as DecodedFormat5 } from "../model/formats/data-format-5";
import {
  createTestValues,
  TestValuesBufferObject,
  TestValuesHex,
  TestValuesNumber,
  TestValuesNumberObject,
  testWith,
  testWithMatch,
  toBuffer,
} from "./test-util";

type TestVector = [string, DecodedFormat5];

const validData: TestVector = [
  "99040512FC5394C37C0004FFFC040CAC364200CDCBB8334C884F",
  {
    manufacturerId: "0499",
    version: 5,
    temperature: 24.3,
    pressure: 100_044,
    humidity: 53.49,
    acceleration: { x: 0.004, y: -0.004, z: 1.036 },
    power: { voltage: 2.977, tx: 4 },
    movementCounter: 66,
    measurementSequence: 205,
    mac: "CBB8334C884F",
  },
];
const maximumData: TestVector = [
  "9904057FFFFFFEFFFE7FFF7FFF7FFFFFDEFEFFFECBB8334C884F",
  {
    manufacturerId: "0499",
    version: 5,
    temperature: 163.835,
    pressure: 115_534,
    humidity: 163.835,
    acceleration: { x: 32.767, y: 32.767, z: 32.767 },
    power: { voltage: 3.646, tx: 20 },
    movementCounter: 254,
    measurementSequence: 65_534,
    mac: "CBB8334C884F",
  },
];
const minimumData: TestVector = [
  "9904058001000000008001800180010000000000CBB8334C884F",
  {
    manufacturerId: "0499",
    version: 5,
    temperature: -163.835,
    pressure: 50_000,
    humidity: 0.0,
    acceleration: { x: -32.767, y: -32.767, z: -32.767 },
    power: { voltage: 1.6, tx: -40 },
    movementCounter: 0,
    measurementSequence: 0,
    mac: "CBB8334C884F",
  },
];
const invalidData: TestVector = [
  "9904058000FFFFFFFF800080008000FFFFFFFFFFFFFFFFFFFFFF",
  {
    manufacturerId: "0499",
    version: 5,
    temperature: NaN,
    pressure: NaN,
    humidity: NaN,
    acceleration: { x: NaN, y: NaN, z: NaN },
    power: { voltage: NaN, tx: NaN },
    movementCounter: NaN,
    measurementSequence: NaN,
    mac: "FFFFFFFFFFFF",
  },
];

const testVectors: TestVector[] = [validData, maximumData, minimumData, invalidData];

describe("Data format 5 specs", () => {
  describe("decoder", () => {
    it("should decode raw binary data", () => {
      testVectors.forEach(([hexData, expected]) => {
        const data = Buffer.from(hexData, "hex");

        expect(DataFormat5.decode(data)).toStrictEqual(expected);
      });
    });

    it("should decode temperature", () => {
      const testValues = [
        ["0000", 0],
        ["12FC", 24.3],
        ["01c3", 2.255],
        ["fe3d", -2.255],
        ["8000", NaN],
      ] satisfies TestValuesHex[];

      const buffered = testValues.map(toBuffer(createTestValues("hex")));
      buffered.forEach(testWith(DataFormat5.decodeTemperature));

      expect(DataFormat5.decodeTemperature(Buffer.from("99040512FC", "hex"), 3)).toBe(24.3);
    });

    it("should decode humidity", () => {
      const testValues = [
        [0, 0],
        [10_010, 25.025],
        [40_000, 100.0],
        [65_535, NaN],
      ] satisfies TestValuesNumber[];

      const buffered = testValues.map(toBuffer(createTestValues("UInt16BE")));
      buffered.forEach(testWith(DataFormat5.decodeHumidity));
    });

    it("should decode atmospheric pressure", () => {
      const testValues = [
        [0, 50_000],
        [51_325, 10_1325],
        [65_534, 11_5534],
        [65_535, NaN],
      ] satisfies TestValuesNumber[];

      const buffered = testValues.map(toBuffer(createTestValues("UInt16BE")));
      buffered.forEach(testWith(DataFormat5.decodePressure));
    });

    it("should decode acceleration", () => {
      const testValues = [
        ["fc18", -1],
        ["03e8", 1],
        ["8000", NaN],
      ] satisfies TestValuesHex[];

      const buffered = testValues.map(toBuffer(createTestValues("hex")));
      buffered.forEach(testWith(DataFormat5.decodeAcceleration));
    });

    it("should decode movement counter", () => {
      const testValues = [
        [0, 0],
        [100, 100],
        [255, NaN],
      ] satisfies TestValuesNumber[];

      const buffered = testValues.map(toBuffer(createTestValues("UInt8")));
      buffered.forEach(testWith(DataFormat5.decodeMovementCounter));
    });

    it("should decode battery voltage", () => {
      const testValues: TestValuesNumberObject[] = [
        [0, { voltage: 1.6 }],
        [1400, { voltage: 3.0 }],
        [2047, { voltage: NaN }],
      ] satisfies TestValuesNumberObject[];

      const buffered: TestValuesBufferObject[] = testValues.map(([value, expected]) => {
        const tmp = value << 5;
        const buf = Buffer.alloc(2);
        buf.writeUInt16BE(tmp);
        return [buf, expected] satisfies TestValuesBufferObject;
      });

      buffered.forEach(testWithMatch(DataFormat5.decodePower));
    });

    it("should decode tx power", () => {
      const testValues: TestValuesNumberObject[] = [
        [0, { tx: -40 }],
        [22, { tx: 4 }],
        [31, { tx: NaN }],
      ] satisfies TestValuesNumberObject[];

      const buffered: TestValuesBufferObject[] = testValues.map(([value, expected]) => {
        const buf = Buffer.alloc(2);
        buf.writeUInt16BE(value);
        return [buf, expected] satisfies TestValuesBufferObject;
      });

      buffered.forEach(testWithMatch(DataFormat5.decodePower));
    });

    it("should decode measurement sequence number", () => {
      const testValues = [
        [0, 0],
        [1000, 1000],
        [65_535, NaN],
      ] satisfies TestValuesNumber[];

      const buffered = testValues.map(toBuffer(createTestValues("UInt16BE")));
      buffered.forEach(testWith(DataFormat5.decodeMeasurementSequenceNumber));
    });
  });
});
