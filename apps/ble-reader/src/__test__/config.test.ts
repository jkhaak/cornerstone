import { parseConfig } from "../config";
import fs from "node:fs";
import os from "node:os";

describe("config", () => {
  const validConfigWithAuth = { mqtt: { url: "mqtt://localhost:1883", username: "user", password: "pass" } };

  it("should parse config file and produce config object", () => {
    const configPath = `${os.tmpdir()}/config.json`;
    fs.writeFileSync(configPath, JSON.stringify(validConfigWithAuth, null, 2));

    const result = parseConfig(configPath);

    expect(result).toStrictEqual(validConfigWithAuth);

    fs.unlinkSync(configPath);
  });

  it("should throw error if config file is not valid", () => {
    const configPath = `${os.tmpdir()}/config.json`;
    fs.writeFileSync(configPath, JSON.stringify({ quux: { url: "mqtt://localhost:1883" } }, null, 2));

    expect(() => parseConfig(configPath)).toThrowError(/Invalid config file/);

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
});
