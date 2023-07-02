import { environment } from "@cornerstone/core";

export function configToEnvironment(config: Record<string, string | number | boolean>) {
  for (const [key, val] of Object.entries(config)) {
    if (typeof val === "string") {
      environment.setEnv(key, val);
    } else {
      environment.setEnv(key, val.toString());
    }
  }
}
