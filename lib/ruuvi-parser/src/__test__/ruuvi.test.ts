import * as Ruuvi from "../model/ruuvi";

const MANUFACTURER_ID = "9904" as const;

const adData1 = Buffer.from("99040504aa7bb6c8f4fd0cfd4800007c76b92fa5f897846a37e6", "hex");

describe("Ruuvi tag advertisement data parser", () => {
  it("should be able to parse advertisement data", async () => {
    const data = await Ruuvi.decodeAsync(adData1);
    expect(data).toMatchObject({
      manufacturerId: "499",
      version: 5,
    });
  });

  it("should reject with an error with unknown manufacturer id", () => {
    return expect(Ruuvi.decodeAsync(Buffer.from("deadbeef", "hex"))).rejects.toThrow();
  });

  it("should throw an error with unknown data format version", () => {
    const invalidVersion = `${MANUFACTURER_ID}42`;
    return expect(Ruuvi.decodeAsync(Buffer.from(invalidVersion, "hex"))).rejects.toThrow();
  });
});
