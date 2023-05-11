import type { DataFormat5 } from "@cornerstone/ruuvi-parser";
import type { CamelToSnakeKeys, NonNullableObj } from "@cornerstone/typing-tools";

export type RuuviId = `${Uppercase<string>}`;

export type RawEvent = {
  id: string;
  datetime: string;
  manufacturerDataHex: string;
  data: NonNullableObj<DataFormat5>;
};

export type QueryResultRuuviTag = CamelToSnakeKeys<RuuviTag>;

export type RuuviTag = {
  id: RuuviId;
  mac: string;
  displayName: string | undefined;
};

export function dtoRuuviTag(queryResult: QueryResultRuuviTag): RuuviTag {
  const { id, mac } = queryResult;

  return {
    id,
    mac,
    displayName: queryResult.display_name,
  } satisfies RuuviTag;
}
