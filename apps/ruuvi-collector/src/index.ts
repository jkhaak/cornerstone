import type { RuuviData } from "./dataformat";

export function parse(input: Buffer): RuuviData {
  return {
    manufacturerId: "9904",
    version: 5
  };
}
