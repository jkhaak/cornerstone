import type { Device } from "node-ble";
import type { EventHandler } from "../services/ruuvi.js";
import { RuuviService } from "../services/ruuvi.js";
import { setTimeout } from "node:timers/promises";

const deviceMock = {
  getAlias: jest.fn().mockResolvedValue("unknown device"),
};

const endpointMock = jest.fn().mockResolvedValue(true) as unknown as EventHandler;

const deviceMockAsDevice = deviceMock as unknown as Device;

describe("ruuvi service", () => {
  describe("handle new device event", () => {
    let ruuviService: RuuviService;

    beforeEach(() => {
      ruuviService = new RuuviService();
      ruuviService.setEndpoint(endpointMock);
    });

    afterEach(() => {
      ruuviService.stopTimers();
    });

    it("should start a timer for Ruuvi tag", async () => {
      const tagName = "Ruuvi DEAD";
      deviceMock.getAlias.mockResolvedValueOnce(tagName);

      ruuviService.handleNewDevice("", deviceMockAsDevice);
      expect(deviceMock.getAlias).toHaveBeenCalled();
      await setTimeout(100);

      const devices = ruuviService.listDevices();
      expect(devices).toStrictEqual([tagName]);
    });

    it("should not start timer for unknown device", async () => {
      ruuviService.handleNewDevice("", deviceMockAsDevice);
      expect(deviceMock.getAlias).toHaveBeenCalled();
      await setTimeout(100);

      const devices = ruuviService.listDevices();
      expect(devices).toStrictEqual([]);
    });
  });
});
