import { formatRFC3339 } from "date-fns";

export function format(date: Date) {
  return formatRFC3339(date, { fractionDigits: 3 });
}
