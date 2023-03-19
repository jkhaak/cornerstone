import { parse } from "../model/formats/data-format-5";

describe("Data format 5 specs", () => {
  const adData1 = Buffer.from("99040504aa7bb6c8f4fd0cfd4800007c76b92fa5f897846a37e6", "hex");
  const adData2 = Buffer.from("99040511623a3fc8d601c80394ffe4b356988f7adb7a25194f70", "hex");

  it("should support temperature", () => {
    expect(parse(adData1)).toEqual({
      manufacturerId: "499",
      version: 5,
      humidity: 0,
      pressure: 0,
      acceleration: {
        x: 0,
        y: 0,
        z: 0
      },
      power: 0,
      txPower: 0,
      movementCounter: 0,
      measurementSequence: 0,
      mac: ""
    });
  });
});
