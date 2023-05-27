import { formatInTimeZone } from "date-fns-tz";

export function format(date: Date | number) {
  const d = date instanceof Date ? date : new Date(date);
  return formatInTimeZone(d, "UTC", "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
}
