import { parseConfig, configToEnvironment } from "../config";
import fs from "node:fs";
import os from "node:os";

describe("config", () => {
  const config = { foo: "bar", bar: "baz", baz: true, quux: 123 };

  it("should parse config file and produce config object", () => {
    const configPath = `${os.tmpdir()}/config.json`;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    parseConfig(configPath);

    for (const [key, val] of Object.entries(config)) {
      expect(process.env[key.toUpperCase()]).toBe(val.toString());
    }

    fs.unlinkSync(configPath);
  });

  it("should throw error if config file does not exist", () => {
    expect(() => parseConfig("does-not-exist.json")).toThrowError(/Could not read config file/);
  });

  it("should throw error if config file is not valid JSON", () => {
    const configPath = `${os.tmpdir()}/config.json`;
    fs.writeFileSync(configPath, "this is not valid JSON");

    expect(() => parseConfig(configPath)).toThrowError(/Could not parse config file/);

    fs.unlinkSync(configPath);
  });

  it("should read config object and produce environment variables", () => {
    configToEnvironment(config);

    // eslint-disable-next-line dot-notation
    for (const [key, val] of Object.entries(config)) {
      expect(process.env[key.toUpperCase()]).toBe(val.toString());
    }
  });
});
