/*
import type { Device } from "node-ble";
import { RuuviService } from "../services/ruuvi";
// import type { Endpoint } from "../services/endpoint";
import { setTimeout } from "node:timers/promises";

const deviceMock = {
  getAlias: jest.fn().mockResolvedValue("unknown device"),
};

// const endpointMock = {
//   sendEvent: jest.fn().mockResolvedValue(true),
// } as unknown as Endpoint;

const deviceMockAsDevice = deviceMock as unknown as Device;

describe("ruuvi service", () => {
  describe("handle new device event", () => {
    let ruuviService: RuuviService;

    afterEach(() => {
      ruuviService.stopTimers();
    });

    it("should start a timer for Ruuvi tag", async () => {
      ruuviService = new RuuviService(endpointMock);
      const tagName = "Ruuvi DEAD";
      deviceMock.getAlias.mockResolvedValueOnce(tagName);

      ruuviService.handleNewDevice("", deviceMockAsDevice);
      expect(deviceMock.getAlias).toHaveBeenCalled();
      await setTimeout(100);

      const devices = ruuviService.listDevices();
      expect(devices).toStrictEqual([tagName]);
    });

    it("should not start timer for unknown device", async () => {
      ruuviService = new RuuviService(endpointMock);

      ruuviService.handleNewDevice("", deviceMockAsDevice);
      expect(deviceMock.getAlias).toHaveBeenCalled();
      await setTimeout(100);

      const devices = ruuviService.listDevices();
      expect(devices).toStrictEqual([]);
    });
  });
});
*/
