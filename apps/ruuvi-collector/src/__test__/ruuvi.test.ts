import * as Ruuvi from "../model/ruuvi.js";

const MANUFACTURER_ID = "9904" as const;

describe("Ruuvi tag advertisement data parser", () => {
  const adData1 = Buffer.from("99040504aa7bb6c8f4fd0cfd4800007c76b92fa5f897846a37e6", "hex");
  const adData2 = Buffer.from("99040511623a3fc8d601c80394ffe4b356988f7adb7a25194f70", "hex");

  it("should be able to parse advertisement data", () => {
    expect(Ruuvi.parse(adData1)).toStrictEqual({
      manufacturerId: "499",
      version: 5
    });
  });

  it("should throw an error with unknown manufacturer id", () => {
    expect(() => Ruuvi.parse(Buffer.from("deadbeef", "hex"))).toThrow();
    expect(Ruuvi.parseGraceful(adData1)).not.toBeUndefined();
    expect(Ruuvi.parseGraceful(Buffer.from("deadbeef", "hex"))).toBeUndefined();
  });

  it("should throw an error with unknown data format version", () => {
    const invalidVersion = `${MANUFACTURER_ID}42`;
    expect(() => Ruuvi.parse(Buffer.from(invalidVersion, "hex"))).toThrow();

    expect(Ruuvi.parseGraceful(adData1)).not.toBeUndefined();
    expect(Ruuvi.parseGraceful(Buffer.from(invalidVersion, "hex"))).toBeUndefined();
  });
});
