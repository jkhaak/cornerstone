import * as DataFormat5 from "../model/formats/data-format-5";
import type { Format as TDataFormat5 } from "../model/formats/data-format-5";
import { createTestValues, TestValuesHex, TestValuesNumber, testWith, toBuffer } from "./test-util";

type TestVector = [string, TDataFormat5];

describe("Data format 5 specs", () => {
  const adData1 = Buffer.from("99040504aa7bb6c8f4fd0cfd4800007c76b92fa5f897846a37e6", "hex");
  const adData2 = Buffer.from("99040511623a3fc8d601c80394ffe4b356988f7adb7a25194f70", "hex");

  const validData: TestVector = [
    "99040512FC5394C37C0004FFFC040CAC364200CDCBB8334C884F",
    {
      manufacturerId: "499",
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
      manufacturerId: "499",
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
      manufacturerId: "499",
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
      manufacturerId: "499",
      version: 5,
      temperature: NaN,
      pressure: NaN,
      humidity: NaN,
      acceleration: { x: NaN, y: NaN, z: NaN },
      power: { voltage: NaN, tx: NaN },
      movementCounter: NaN,
      measurementSequence: NaN,
      mac: undefined,
    },
  ];

  const testVectors: TestVector[] = [validData, maximumData, minimumData, invalidData];

  it("should parse raw binary data", () => {
    testVectors.forEach(([hexData, expected]) => {
      const data = Buffer.from(hexData);

      expect(DataFormat5.parse(data)).toStrictEqual(expected);
    });
  });

  it("should support temperature", () => {
    expect(DataFormat5.parse(adData1)).toEqual({
      manufacturerId: "499",
      version: 5,
      temperature: 0,
      humidity: 0,
      pressure: 0,
      acceleration: {
        x: 0,
        y: 0,
        z: 0,
      },
      power: {
        voltage: 0,
        tx: 0,
      },
      movementCounter: 0,
      measurementSequence: 0,
      mac: "",
    });
  });

  it("should parse temperature", () => {
    const testValues = [
      ["0000", 0],
      ["01c3", 2.255],
      ["fe3d", -2.255],
      ["8000", NaN],
    ] satisfies TestValuesHex[];

    const buffered = testValues.map(toBuffer(createTestValues("hex")));
    buffered.forEach(testWith(DataFormat5.parseTemperature));
  });

  it("should parse humidity", () => {
    const testValues = [
      [0, 0],
      [10_010, 25.025],
      [40_000, 100.0],
      [65_535, NaN],
    ] satisfies TestValuesNumber[];

    const buffered = testValues.map(toBuffer(createTestValues("UInt16BE")));
    buffered.forEach(testWith(DataFormat5.parseHumidity));
  });

  it("should parse atmospheric pressure", () => {
    const testValues = [
      [0, 50_000],
      [51_325, 10_1325],
      [65_534, 11_5534],
      [65_535, NaN],
    ] satisfies TestValuesNumber[];

    const buffered = testValues.map(toBuffer(createTestValues("UInt16BE")));
    buffered.forEach(testWith(DataFormat5.parsePressure));
  });

  it("should parse acceleration", () => {
    const testValues = [
      ["fc18", -1000],
      ["03e8", 1000],
      ["8000", NaN],
    ] satisfies TestValuesHex[];

    const buffered = testValues.map(toBuffer(createTestValues("hex")));
    buffered.forEach(testWith(DataFormat5.parseAcceleration));
  });

  it("should parse movement counter", () => {
    const testValues = [
      [0, 0],
      [100, 100],
      [255, NaN],
    ] satisfies TestValuesNumber[];

    const buffered = testValues.map(toBuffer(createTestValues("UInt8")));
    buffered.forEach(testWith(DataFormat5.parseMovementCounter));
  });

  it("should parse battery voltage", () => {
    const testValues = [
      [0, 1600],
      [1400, 3000],
      [2047, NaN],
    ] satisfies TestValuesNumber[];

    const buffered = testValues.map(toBuffer(createTestValues("UInt16BE")));
    buffered.forEach(testWith(DataFormat5.parseBatteryVoltage));
  });

  it("should parse tx power", () => {
    const testValues = [
      [0, -40],
      [22, 4],
      [31, NaN],
    ] satisfies TestValuesNumber[];

    const buffered = testValues.map(toBuffer(createTestValues("UInt8")));
    buffered.forEach(testWith(DataFormat5.parseTxPower));
  });

  it("should parse measurement sequence number", () => {
    const testValues = [
      [0, 0],
      [1000, 1000],
      [65_535, NaN],
    ] satisfies TestValuesNumber[];

    const buffered = testValues.map(toBuffer(createTestValues("UInt16BE")));
    buffered.forEach(testWith(DataFormat5.parseMeasurementSequenceNumber));
  });
});
