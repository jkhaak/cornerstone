import fs from "node:fs";
import os from "node:os";

import { expectTypeOf } from "expect-type";
import { type } from "arktype";

import { parseConfig } from "../config.js";

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
  let configPath: string;

  beforeEach(() => {
    configPath = `${os.tmpdir()}/config.json`;
  });

  afterEach(() => {
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
  });

  it("should parse config file and produce config object", () => {
    fs.writeFileSync(configPath, JSON.stringify(validConfigWithAuth, null, 2));

    const result = parseConfig(configPath, testSchema);
    expect(result).not.toBeUndefined();

    expectTypeOf(result).toMatchTypeOf<TestSchema>();

    expect(result).toStrictEqual(validConfigWithAuth);
  });

  it("should throw error if config file does not exist", () => {
    expect(() => parseConfig("does-not-exist.json", testSchema)).toThrowError(/Could not read config file/);
  });

  it("should throw error if config file is not valid JSON", () => {
    fs.writeFileSync(configPath, "this is not valid JSON");

    expect(() => parseConfig(configPath, testSchema)).toThrowError(/Could not parse config file/);
  });
});
