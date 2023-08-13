import { expectTypeOf } from "expect-type";
import { parseConfig } from "../config.js";
import fs from "node:fs";
import os from "node:os";

import { type } from "arktype";

const testSchema = type({
  mqtt: {
    url: "string",
    username: "string",
    password: "string",
  },
});

type TestSchema = typeof testSchema.infer;

describe("config", () => {
  const validConfigWithAuth = { mqtt: { url: "mqtt://localhost:1883", username: "user", password: "pass" } };

  it("should parse config file and produce config object", () => {
    const configPath = `${os.tmpdir()}/config.json`;
    fs.writeFileSync(configPath, JSON.stringify(validConfigWithAuth, null, 2));

    // const { data, problems } = testSchema({});
    //     ^?

    const { data, problems } = testSchema(parseConfig(configPath));
    expect(problems).toBeUndefined();
    expect(data).not.toBeUndefined();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result: TestSchema = data!;

    // expectTypeOf(result).toMatchTypeOf<BaseOutput>();

    expect(result).toStrictEqual(validConfigWithAuth);

    fs.unlinkSync(configPath);
  });

  it("should throw error if config file is not valid", () => {
    const configPath = `${os.tmpdir()}/config.json`;
    fs.writeFileSync(configPath, JSON.stringify({ quux: { url: "mqtt://localhost:1883" } }, null, 2));

    // expect(() => parseConfig(configPath, BaseTestSchema)).toThrowError(/Invalid config file/);

    fs.unlinkSync(configPath);
  });

  it("should throw error if config file does not exist", () => {
    // expect(() => parseConfig("does-not-exist.json", BaseTestSchema)).toThrowError(
    //   /Could not read config file/
    // );
  });

  it("should throw error if config file is not valid JSON", () => {
    const configPath = `${os.tmpdir()}/config.json`;
    fs.writeFileSync(configPath, "this is not valid JSON");

    // expect(() => parseConfig(configPath, BaseTestSchema)).toThrowError(/Could not parse config file/);

    fs.unlinkSync(configPath);
  });
});
