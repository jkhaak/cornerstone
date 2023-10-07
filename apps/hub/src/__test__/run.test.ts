jest.mock("@cornerstone/mqtt");

import { Mqtt } from "@cornerstone/mqtt";
import { run } from "../run.js";
import type { Config } from "../model.js";

const mqttConfig = {
  url: "mqtt://localhost",
  username: "user",
  password: "pass",
};

const databaseConfig = {
  cn: "postgres://user:pass@localhost:5432/database",
};

const testConfig = { mqtt: mqttConfig, database: databaseConfig } satisfies Config;

describe("run", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize mqtt", () => {
    run(testConfig);
    expect(Mqtt).toHaveBeenCalledTimes(1);
    expect(Mqtt).toHaveBeenCalledWith(mqttConfig);
  });

  /*
  it("should start store service", () => {
    const storeServiceMock = jest.spyOn(storeServiceModule, "storeService");
    run(testConfig);
    expect(storeServiceMock).toHaveBeenCalledTimes(1);
    expect(storeServiceMock).toHaveBeenCalledWith(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expect.objectContaining({ mqtt: expect.anything(), db: expect.anything() })
    );
  });
  */
});
