import fs from "node:fs";
import z from "zod";

export const ConfigSchema = z.object({
  mqtt: z.object({
    url: z.string(),
    username: z.string().optional(),
    password: z.string().optional(),
  }),
  daemon: z
    .object({
      pidfile: z.string().optional(),
      uid: z.number().default(1000),
      gid: z.number().default(1000),
    })
    .optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

export function parseConfig(path: string) {
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

  const result = ConfigSchema.safeParse(obj);

  if (!result.success) {
    throw new Error("Invalid config file");
  }

  return result.data;
}
