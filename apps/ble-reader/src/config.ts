import { logger } from "@cornerstone/core";
import fs from "node:fs";
import z from "zod";

export const ConfigSchema = z.object({
  mqtt: z.object({
    url: z.string(),
    username: z.string().optional(),
    password: z.string().optional(),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

export function parseConfig(path: string) {
  let rawString: string;
  let obj: unknown;

  try {
    rawString = fs.readFileSync(path, "utf-8");
  } catch (e: unknown) {
    logger.error({ message: `Could not read config file at ${path}` });
    process.exit(1);
  }

  try {
    obj = JSON.parse(rawString) as unknown;
  } catch (e: unknown) {
    logger.error({ message: `Could not parse config file at ${path}` });
    process.exit(2);
  }

  const result = ConfigSchema.safeParse(obj);

  if (!result.success) {
    logger.error({ message: "Invalid config file", error: result.error.format() });
    process.exit(3);
  }

  return result.data;
}
