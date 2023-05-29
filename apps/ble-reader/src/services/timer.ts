import _ from "lodash";

export function randOffset(millis: number) {
  return _.round(_.random(true) * millis - millis / 2);
}
