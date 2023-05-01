import * as dataFormat5 from "./formats/data-format-5";
import type { RuuviData, RuuviManufacturerId } from "./formats/ruuvi-data-types";
import type { Either } from "./utils";
import logger from "../logger";

const ruuviManufacturerId = "499" satisfies RuuviManufacturerId;

export function safeParse(input: Buffer): Either<RuuviData> {
  const manufacturerId = input.readInt16LE(0).toString(16);
  if (manufacturerId !== ruuviManufacturerId) {
    return { type: "error", message: "Unknown manufacturer id" };
  }

  let parser: (b: Buffer) => RuuviData;
  const version = input.readInt8(2);

  switch (version) {
    case 5:
      parser = dataFormat5.parse;
      break;
    default:
      return { type: "error", message: "Unknown data format" };
  }

  return {
    type: "ok",
    value: parser(input),
  };
}

export function parseGraceful(input: Buffer): RuuviData | undefined {
  const either = safeParse(input);

  if (either.type === "error") {
    logger.error({ message: either.message });
    return undefined;
  }

  return either.value;
}

export function parse(input: Buffer): RuuviData {
  const either = safeParse(input);

  if (either.type === "error") {
    throw new Error(either.message);
  }

  return either.value;
}
