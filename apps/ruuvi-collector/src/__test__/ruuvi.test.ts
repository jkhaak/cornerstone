import { parse } from "..";

describe("Ruuvi tag advertisement data parser", () => {
  it("should be able to parse advertisement data", () => {
    const adData1 = Buffer.from("99040504aa7bb6c8f4fd0cfd4800007c76b92fa5f897846a37e6", "hex");
    const adData2 = Buffer.from("99040511623a3fc8d601c80394ffe4b356988f7adb7a25194f70", "hex");

    expect(parse(adData1)).toStrictEqual({
      manufacturerId: "9904",
      version: 5
    });
  });
});
