import * as DataFormat5 from "../model/formats/data-format-5";
import { createTestValues, TestValuesHex, TestValuesNumber, testWith, toBuffer } from "./test-util";

describe("Data format 5 specs", () => {
  const adData1 = Buffer.from("99040504aa7bb6c8f4fd0cfd4800007c76b92fa5f897846a37e6", "hex");
  const adData2 = Buffer.from("99040511623a3fc8d601c80394ffe4b356988f7adb7a25194f70", "hex");

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
      ["fc18", -1_000],
      ["03e8", 1_000],
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
});
