jest.mock("@cornerstone/mqtt");

import { Mqtt } from "@cornerstone/mqtt";
import { run } from "../run.js";
import type { Config } from "../model.js";
import * as databaseModule from "../database.js";
import * as storeServiceModule from "../store-service.js";

const mqttConfig = {
  url: "mqtt://localhost",
  username: "user",
  password: "pass",
};

const databaseConfig = {
  host: "localhost",
  port: 55432,
  database: "testdatabase",
  username: "testuser",
  password: "testpasswd",
};

const testConfig = { mqtt: mqttConfig, database: databaseConfig } satisfies Config;

const getDBMock = jest.spyOn(databaseModule, "getDB");

describe("run", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should initialize mqtt", () => {
    run(testConfig);
    expect(Mqtt).toHaveBeenCalledTimes(1);
    expect(Mqtt).toHaveBeenCalledWith(mqttConfig);
  });

  it("should initialize database", () => {
    run(testConfig);
    expect(getDBMock).toHaveBeenCalledTimes(1);
    expect(getDBMock).toHaveBeenCalledWith(databaseConfig);
  });

  it("should start store service", () => {
    const storeServiceMock = jest.spyOn(storeServiceModule, "storeService");
    run(testConfig);
    expect(storeServiceMock).toHaveBeenCalledTimes(1);
    expect(storeServiceMock).toHaveBeenCalledWith(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expect.objectContaining({ mqtt: expect.anything(), db: expect.anything() })
    );
  });
});
