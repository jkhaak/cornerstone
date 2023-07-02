import { configToEnvironment } from "../config";

describe("config", () => {
  it("should read config object and produce environment variables", () => {
    const config = { foo: "bar", bar: "baz", baz: true, quux: 123 };
    configToEnvironment(config);

    // eslint-disable-next-line dot-notation
    for (const [key, val] of Object.entries(config)) {
      expect(process.env[key.toUpperCase()]).toBe(val.toString());
    }
  });
});
