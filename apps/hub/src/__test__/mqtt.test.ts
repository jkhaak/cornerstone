jest.mock("../service/ruuvi");

import { Mqtt } from "@cornerstone/mqtt";
import * as ruuviService from "../service/ruuvi";
import { ruuvitagMqttController } from "../controller/mqtt";

describe("mqtt controller", () => {
  it("should subscribe to ruuvi/event topic", async () => {
    const storeEventMock = jest.spyOn(ruuviService, "storeEvent");
    const mqttMock = {
      subscribeAsync: jest.fn(),
    };

    ruuvitagMqttController(mqttMock as unknown as Mqtt);

    expect(mqttMock.subscribeAsync).toHaveBeenCalledWith("ruuvi/event/#", expect.any(Function));
    expect(storeEventMock).toBeCalledTimes(0);
    const message = Buffer.from("test");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await mqttMock.subscribeAsync.mock.calls[0][1](message);
    expect(storeEventMock).toBeCalledWith(message);
  });
});
