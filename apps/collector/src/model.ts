import type { DataFormat5 } from "@cornerstone/ruuvi-parser";

export type RuuviId = `${Uppercase<string>}`;

export type RawEvent = {
  id: string;
  datetime: string;
  manufacturerDataHex: string;
  data: DataFormat5;
};
