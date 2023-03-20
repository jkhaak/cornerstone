import * as DataFormat5 from "../model/formats/data-format-5";

type TestValues<T, Input = string> = [Input, T];

const testWith =
  <T>(fn: (b: Buffer) => T) =>
  ([input, expected]: TestValues<T, number | string>) => {
    let buf;
    if (typeof input === "string") {
      buf = Buffer.from(input, "hex");
    } else if (typeof input === "number") {
      buf = Buffer.alloc(2);
      buf.writeUInt16BE(input);
    } else {
      throw new Error("unknown type");
    }

    expect(fn(buf)).toBe(expected);
  };

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

  it("should parse temperature correctly", () => {
    const testValues = [
      ["0000", 0],
      ["01c3", 2.255],
      ["fe3d", -2.255],
      ["8000", NaN],
    ] satisfies TestValues<number, string>[];

    testValues.forEach(testWith(DataFormat5.parseTemperature));
  });

  it.only("should parse humidity correctly", () => {
    const testValues = [
      [0x000, 0],
      [10010, 25.025],
      [40000, 100.0],
      [65535, NaN],
    ] satisfies TestValues<number, number>[];

    testValues.forEach(testWith(DataFormat5.parseHumidity));
  });
});
