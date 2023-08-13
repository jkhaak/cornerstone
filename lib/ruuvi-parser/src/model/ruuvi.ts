import _ from "lodash";
import * as dataFormat5 from "./formats/data-format-5.js";
import type { RuuviData, RuuviManufacturerId } from "./formats/ruuvi-data-types.js";

const ruuviManufacturerId = "0499" satisfies RuuviManufacturerId;

export function encode(input: RuuviData): Buffer {
  let encodeFn: (i: RuuviData) => Buffer;
  const version = input.version;

  switch (version) {
    case 5:
      encodeFn = dataFormat5.encode;
      break;
    default:
      throw new Error("Unknown version");
  }

  return encodeFn(input);
}

export function decodeAsync(input: Buffer): Promise<RuuviData> {
  const manufacturerId = _.padStart(input.readInt16LE(0).toString(16), 4, "0");

  if (manufacturerId !== ruuviManufacturerId) {
    return Promise.reject(new Error("Unknown manufacturer id"));
  }

  let decodeFn: (b: Buffer) => RuuviData;
  const version = input.readInt8(2);

  switch (version) {
    case 5:
      decodeFn = dataFormat5.decode;
      break;
    default:
      return Promise.reject(new Error("Unknown data format"));
  }

  return Promise.resolve(decodeFn(input));
}
