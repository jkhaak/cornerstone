import { getEnv, getEnvOrElse, getEnvOrElseGet, setEnv } from "../environment";

describe("environment", () => {
  describe("getEnv", () => {
    it("should get env", () => {
      const val = "quux";
      const index = "FOOBAR";
      process.env[index] = val;

      const result = getEnv(index);
      expect(result).toBe(val);
    });

    it("should give undefined if environment isn't set", () => {
      const index = "FOOBAR";
      delete process.env[index];

      const result = getEnv(index);
      expect(result).toBeUndefined();
    });
  });

  describe("getEnvOrElse", () => {
    it("should get env if it is set", () => {
      const val = "quux";
      const alternative = "baz";
      const index = "FOOBAR";
      process.env[index] = val;

      const result = getEnvOrElse(index, alternative);
      expect(result).toBe(val);
      expect(result).not.toBe(alternative);
    });

    it("should return alternative if environment isn't set", () => {
      const val = "quux";
      const alternative = "baz";
      const index = "FOOBAR";
      delete process.env[index];

      const result = getEnvOrElse(index, alternative);
      expect(result).not.toBe(val);
      expect(result).toBe(alternative);
    });
  });

  describe("getEnvOrElseGet", () => {
    it("should get env if it is set", () => {
      const val = "quux";
      const alternative = "baz";
      const index = "FOOBAR";
      process.env[index] = val;

      const result = getEnvOrElseGet(index, () => alternative);
      expect(result).toBe(val);
      expect(result).not.toBe(alternative);
    });

    it("should get alternative if environment isn't set", () => {
      const val = "quux";
      const alternative = "baz";
      const index = "FOOBAR";
      delete process.env[index];

      const result = getEnvOrElseGet(index, () => alternative);
      expect(result).not.toBe(val);
      expect(result).toBe(alternative);
    });

    it("should execute alternative function if environment is not set", () => {
      const val = "quux";
      const alternative = "baz";
      const index = "FOOBAR";
      delete process.env[index];

      let executed = false;
      const result = getEnvOrElseGet(index, () => {
        executed = true;
        return alternative;
      });
      expect(result).toBe(alternative);
      expect(result).not.toBe(val);
      expect(executed).toBeTruthy();
    });

    it("should not execute alternative function if environment is set", () => {
      const val = "quux";
      const alternative = "baz";
      const index = "FOOBAR";
      process.env[index] = val;

      let executed = false;
      const result = getEnvOrElseGet(index, () => {
        executed = true;
        return alternative;
      });
      expect(result).toBe(val);
      expect(executed).toBeFalsy();
    });

    it("should throw an error from alternative if environment variable is not found", () => {
      const index = "FOOBAR";
      delete process.env[index];

      let executed = false;
      const errorThrowingAlternativeFn = () => {
        executed = true;
        throw new Error("error");
      };

      const fn = () => getEnvOrElseGet(index, errorThrowingAlternativeFn);
      expect(fn).toThrow();
      expect(executed).toBeTruthy();
    });

    it("should not throw error from alternative if environment variable is found", () => {
      const val = "quux";
      const index = "FOOBAR";
      process.env[index] = val;

      let executed = false;
      const errorThrowingAlternativeFn = () => {
        executed = true;
        throw new Error("error");
      };

      const fn = () => getEnvOrElseGet(index, errorThrowingAlternativeFn);

      expect(fn).not.toThrow();
      expect(executed).toBeFalsy();

      executed = false;
      const result = fn();
      expect(result).toBe(val);
      expect(executed).toBeFalsy();
    });
  });

  describe("setEnv", () => {
    const env = "quux";

    afterEach(() => {
      delete process.env[env.toUpperCase()];
      delete process.env[env.toLowerCase()];
    });

    it("should set env", () => {
      const value = "baz";

      expect(process.env[env.toUpperCase()]).toBeUndefined();
      expect(process.env[env.toLowerCase()]).toBeUndefined();

      setEnv(env, value);

      expect(process.env[env.toUpperCase()]).toBe(value);
      expect(process.env[env.toLowerCase()]).toBeUndefined();
    });
  });
});
