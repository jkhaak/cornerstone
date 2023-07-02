import { environment } from "@cornerstone/core";
import fs from "node:fs";

type Config = Record<string, string | number | boolean>;

export function configToEnvironment(config: Config) {
  for (const [key, val] of Object.entries(config)) {
    if (typeof val === "string") {
      environment.setEnv(key, val);
    } else {
      environment.setEnv(key, val.toString());
    }
  }
}

export function parseConfig(path: string) {
  let rawString;
  let obj;

  try {
    rawString = fs.readFileSync(path, "utf-8");
  } catch (e: unknown) {
    throw new Error(`Could not read config file at ${path}`);
  }

  try {
    obj = JSON.parse(rawString) as Config;
  } catch (e: unknown) {
    throw new Error(`Could not parse config file at ${path}`);
  }

  configToEnvironment(obj);
}
