import type { EventHandler } from "../services/ruuvi";
import { RuuviService } from "../services/ruuvi";
import { setImmediate } from "node:timers/promises";
import type { Device } from "../model";

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
      await setImmediate();

      const devices = ruuviService.listDevices();
      expect(devices).toStrictEqual([tagName]);
    });

    it("should not start timer for unknown device", async () => {
      ruuviService.handleNewDevice("", deviceMockAsDevice);
      expect(deviceMock.getAlias).toHaveBeenCalled();
      await setImmediate();

      const devices = ruuviService.listDevices();
      expect(devices).toStrictEqual([]);
    });
  });
});
