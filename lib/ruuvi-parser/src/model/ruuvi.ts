import * as dataFormat5 from "./formats/data-format-5";
import type { RuuviData, RuuviManufacturerId } from "./formats/ruuvi-data-types";

const ruuviManufacturerId = "499" satisfies RuuviManufacturerId;

export function decodeAsync(input: Buffer): Promise<RuuviData> {
  const manufacturerId = input.readInt16LE(0).toString(16);
  if (manufacturerId !== ruuviManufacturerId) {
    return Promise.reject(new Error("Unknown manufacturer id"));
  }

  let decode: (b: Buffer) => RuuviData;
  const version = input.readInt8(2);

  switch (version) {
    case 5:
      decode = dataFormat5.decode;
      break;
    default:
      return Promise.reject(new Error("Unknown data format"));
  }

  return Promise.resolve(decode(input));
}
