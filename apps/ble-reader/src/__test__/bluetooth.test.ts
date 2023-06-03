import { Bluetooth } from "../services/bluetooth";
import type NodeBle from "node-ble";

const adapterMock = {
  isDiscovering: jest.fn().mockResolvedValue(true),
  startDiscovery: jest.fn().mockResolvedValue(undefined),
  stopDiscovery: jest.fn().mockResolvedValue(undefined),
  devices: jest.fn().mockResolvedValue([]),
  getAddress: jest.fn().mockResolvedValue("12:34:DE:AD:BE:EF"),
};
const bluetoothMock = {
  defaultAdapter: jest.fn().mockResolvedValue(adapterMock),
  adapters: jest.fn().mockResolvedValue(["hci0"]),
  getAdapter: jest.fn().mockResolvedValue(adapterMock),
};
const bluetoothForConstructor = bluetoothMock as unknown as NodeBle.Bluetooth;
const destroyMock = jest.fn();

const BLUETOOTH_ADAPTER_ENV = "BLUETOOTH_ADAPTER";

describe("bluetooth wrapper", () => {
  describe("adapter", () => {
    let bluetooth: Bluetooth;

    afterEach(async () => {
      delete process.env[BLUETOOTH_ADAPTER_ENV];
      if (bluetooth) {
        await bluetooth.stopDiscovery();
      }
    });

    it("should use fallback to default if no environment variable has been set", async () => {
      delete process.env[BLUETOOTH_ADAPTER_ENV];

      bluetooth = new Bluetooth(bluetoothForConstructor, destroyMock);
      await bluetooth.getAdapter();

      expect(bluetoothMock.defaultAdapter.mock.calls).toStrictEqual([[]]);
    });

    it("should try to find device by device name", async () => {
      const deviceName = "hci12";
      process.env[BLUETOOTH_ADAPTER_ENV] = deviceName;
      bluetoothMock.adapters.mockResolvedValueOnce(["hci0", "hci1", deviceName, "hci30"]);

      bluetooth = new Bluetooth(bluetoothForConstructor, destroyMock);
      await bluetooth.getAdapter();

      expect(bluetoothMock.getAdapter.mock.calls).toStrictEqual([[deviceName]]);
    });

    it("should try to find device by mac", async () => {
      const deviceName = "hci12";
      const macAddress = "00:11:22:33:44:55";
      const _adapterMock = {
        getAddress: jest.fn().mockResolvedValue(macAddress),
        isDiscovering: jest.fn().mockResolvedValueOnce(true),
        stopDiscovery: jest.fn().mockResolvedValue(undefined),
      };
      process.env[BLUETOOTH_ADAPTER_ENV] = macAddress;

      bluetoothMock.adapters.mockResolvedValueOnce(["hci0", "hci1", deviceName, "hci30"]);
      bluetoothMock.getAdapter = jest.fn((name) => {
        if (name === deviceName) {
          return _adapterMock;
        }
        return Promise.resolve(adapterMock);
      });

      bluetooth = new Bluetooth(bluetoothForConstructor, destroyMock);
      await bluetooth.getAdapter();

      expect(bluetoothMock.getAdapter.mock.calls.length).toBe(4);
      expect(bluetoothMock.getAdapter.mock.calls[2]).toStrictEqual([deviceName]);
      expect(_adapterMock.getAddress.mock.calls).toStrictEqual([[]]);
    });

    it("should throw error if no adapter has been found", async () => {
      process.env[BLUETOOTH_ADAPTER_ENV] = "DOES NOT EXIST";

      bluetooth = new Bluetooth(bluetoothForConstructor, destroyMock);
      await expect(() => bluetooth.getAdapter()).rejects.toThrowError("");
      expect(adapterMock.getAddress.mock.calls).toStrictEqual([[]]);
    });
  });

  describe("features", () => {
    let bluetooth: Bluetooth;

    afterEach(async () => {
      if (bluetooth) {
        await bluetooth.stopDiscovery();
      }
    });

    it("should be able to start discovery", async () => {
      bluetooth = new Bluetooth(bluetoothForConstructor, destroyMock);
      adapterMock.isDiscovering.mockResolvedValueOnce(false);
      await bluetooth.startDiscovery();

      expect(bluetoothMock.defaultAdapter.mock.calls).toStrictEqual([[]]);
      expect(adapterMock.isDiscovering.mock.calls).toStrictEqual([[]]);
      expect(adapterMock.startDiscovery.mock.calls).toStrictEqual([[]]);
      expect(adapterMock.stopDiscovery.mock.calls).toStrictEqual([]);
      expect(destroyMock.mock.calls).toStrictEqual([]);
    });

    it("should be able to stop discovery", async () => {
      bluetooth = new Bluetooth(bluetoothForConstructor, destroyMock);
      await bluetooth.stopDiscovery();

      expect(bluetoothMock.defaultAdapter.mock.calls).toStrictEqual([[]]);
      expect(adapterMock.isDiscovering.mock.calls).toStrictEqual([[]]);
      expect(adapterMock.startDiscovery.mock.calls).toStrictEqual([]);
      expect(adapterMock.stopDiscovery.mock.calls).toStrictEqual([[]]);
      expect(destroyMock.mock.calls).toStrictEqual([]);
    });

    it("should be able to destroy bluetooth connection", async () => {
      bluetooth = new Bluetooth(bluetoothForConstructor, destroyMock);
      await bluetooth.destroy();

      expect(bluetoothMock.defaultAdapter.mock.calls).toStrictEqual([[]]);
      expect(adapterMock.isDiscovering.mock.calls).toStrictEqual([[]]);
      expect(adapterMock.startDiscovery.mock.calls).toStrictEqual([]);
      expect(adapterMock.stopDiscovery.mock.calls).toStrictEqual([[]]);
      expect(destroyMock.mock.calls).toStrictEqual([[]]);
    });
  });
});
