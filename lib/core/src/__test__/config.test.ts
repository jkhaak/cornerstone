import { expectTypeOf } from "expect-type";
import { parseConfig } from "../config";
import fs from "node:fs";
import os from "node:os";
import z from "zod";

const BaseTestSchema = z.object({
  mqtt: z.object({
    url: z.string(),
    username: z.string().default("username"),
    password: z.string(),
  }),
});

type BaseInput = z.input<typeof BaseTestSchema> & {
  children: BaseInput[];
};

type BaseOutput = z.output<typeof BaseTestSchema> & {
  children: BaseOutput[];
};

const TestSchema: z.ZodType<BaseOutput, z.ZodTypeDef, BaseInput> = BaseTestSchema.extend({
  children: z.lazy(() => TestSchema.array()),
});

// type InputTestSchema = z.input<typeof BaseTestSchema>
// type OutputTestSchema = z.output<typeof BaseTestSchema>
// const TestSchema: z.ZodType<OutputTestSchema, z.ZodTypeDef, InputTestSchema> = BaseTestSchema

describe("config", () => {
  const validConfigWithAuth = { mqtt: { url: "mqtt://localhost:1883", username: "user", password: "pass" } };

  it("should parse config file and produce config object", () => {
    const configPath = `${os.tmpdir()}/config.json`;
    fs.writeFileSync(configPath, JSON.stringify(validConfigWithAuth, null, 2));

    const foo = TestSchema.parse({});
    //    ^?

    const result = parseConfig(configPath, TestSchema);
    //    ^?
    expectTypeOf(result).toMatchTypeOf<BaseOutput>();

    expect(result).toStrictEqual(validConfigWithAuth);

    fs.unlinkSync(configPath);
  });

  it("should throw error if config file is not valid", () => {
    const configPath = `${os.tmpdir()}/config.json`;
    fs.writeFileSync(configPath, JSON.stringify({ quux: { url: "mqtt://localhost:1883" } }, null, 2));

    expect(() => parseConfig(configPath, BaseTestSchema)).toThrowError(/Invalid config file/);

    fs.unlinkSync(configPath);
  });

  it("should throw error if config file does not exist", () => {
    expect(() => parseConfig("does-not-exist.json", BaseTestSchema)).toThrowError(
      /Could not read config file/
    );
  });

  it("should throw error if config file is not valid JSON", () => {
    const configPath = `${os.tmpdir()}/config.json`;
    fs.writeFileSync(configPath, "this is not valid JSON");

    expect(() => parseConfig(configPath, BaseTestSchema)).toThrowError(/Could not parse config file/);

    fs.unlinkSync(configPath);
  });
});
