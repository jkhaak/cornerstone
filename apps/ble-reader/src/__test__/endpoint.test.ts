import type { Mqtt } from "@cornerstone/mqtt";
import { sendEvent } from "../services/endpoint";

const mqttMock = {
  publish: jest.fn(),
};
const mqtt = mqttMock as unknown as Mqtt;

describe("endpoint", () => {
  it("should pass topic and message to mqtt", () => {
    const topic = "topic";
    const message = { message: "message" };

    const eventHandler = sendEvent(mqtt);
    expect(mqttMock.publish.mock.calls.length).toBe(0);

    eventHandler(topic, message);
    expect(mqttMock.publish).toHaveBeenCalledWith(topic, JSON.stringify(message));
    expect(mqttMock.publish.mock.calls.length).toBe(1);
  });
});
