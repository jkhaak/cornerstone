import type { Device } from "node-ble";
import { RuuviService } from "../services/ruuvi";
import type { Endpoint } from "../services/endpoint";

const deviceMock = {
  getAlias: jest.fn().mockResolvedValue("unknown device"),
};

const endpointMock = {
  sendEvent: jest.fn().mockResolvedValue(true),
} as unknown as Endpoint;

const deviceMockAsDevice = deviceMock as unknown as Device;

describe("ruuvi service", () => {
  describe("handle new device event", () => {
    it("should check the alias of a device", async () => {
      const ruuviService = new RuuviService(endpointMock);

      ruuviService.handleNewDevice("", deviceMockAsDevice);

      expect(deviceMock.getAlias).toHaveBeenCalled();
    });
  });
});
