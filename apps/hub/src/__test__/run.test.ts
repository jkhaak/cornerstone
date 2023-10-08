jest.mock("@cornerstone/mqtt");

import { Mqtt } from "@cornerstone/mqtt";
import { run } from "../run.js";
import type { Config } from "../model/config.js";
import * as mqttController from "../controller/mqtt.js";

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

  it("should start store service", () => {
    const mqttControllerMock = jest.spyOn(mqttController, "ruuvitagMqttController");
    run(testConfig);
    expect(mqttControllerMock).toHaveBeenCalledTimes(1);
    expect(mqttControllerMock).toHaveBeenCalledWith(expect.any(Mqtt));
  });
});
