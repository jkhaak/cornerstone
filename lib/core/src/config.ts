import fs from "node:fs";

export function parseConfig(path: string): unknown {
  let rawString: string;
  let obj: unknown;

  try {
    rawString = fs.readFileSync(path, "utf-8");
  } catch (e: unknown) {
    throw new Error(`Could not read config file at ${path}`);
  }

  try {
    obj = JSON.parse(rawString) as unknown;
  } catch (e: unknown) {
    throw new Error(`Could not parse config file at ${path}`);
  }

  return obj;
}
