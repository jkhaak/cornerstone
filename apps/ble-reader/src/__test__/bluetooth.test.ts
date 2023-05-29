import { Bluetooth } from "../services/bluetooth";
import type NodeBle from "node-ble";

const adapterMock = {
  isDiscovering: jest.fn().mockResolvedValue(true).mockResolvedValueOnce(false),
  startDiscovery: jest.fn().mockResolvedValue(undefined),
  stopDiscovery: jest.fn().mockResolvedValue(undefined),
  devices: jest.fn().mockResolvedValue([]),
};
const bluetoothMock = {
  defaultAdapter: jest.fn(() => Promise.resolve(adapterMock)),
};
const bluetoothForConstructor = bluetoothMock as unknown as NodeBle.Bluetooth;
const destroyMock = jest.fn();

describe("bluetooth wrapper", () => {
  it("should be able to start discovery", async () => {
    const bluetooth = new Bluetooth(bluetoothForConstructor, destroyMock);
    await bluetooth.startDiscovery();

    expect(bluetoothMock.defaultAdapter.mock.calls).toStrictEqual([[]]);
    expect(adapterMock.isDiscovering.mock.calls).toStrictEqual([[]]);
    expect(adapterMock.startDiscovery.mock.calls).toStrictEqual([[]]);
    expect(adapterMock.stopDiscovery.mock.calls).toStrictEqual([]);
    expect(destroyMock.mock.calls).toStrictEqual([]);
  });

  it("should be able to stop discovery", async () => {
    const bluetooth = new Bluetooth(bluetoothForConstructor, destroyMock);
    await bluetooth.stopDiscovery();

    expect(bluetoothMock.defaultAdapter.mock.calls).toStrictEqual([[]]);
    expect(adapterMock.isDiscovering.mock.calls).toStrictEqual([[]]);
    expect(adapterMock.startDiscovery.mock.calls).toStrictEqual([]);
    expect(adapterMock.stopDiscovery.mock.calls).toStrictEqual([[]]);
    expect(destroyMock.mock.calls).toStrictEqual([]);
  });

  it("should be able to destroy bluetooth connection", async () => {
    const bluetooth = new Bluetooth(bluetoothForConstructor, destroyMock);
    await bluetooth.destroy();

    expect(bluetoothMock.defaultAdapter.mock.calls).toStrictEqual([[]]);
    expect(adapterMock.isDiscovering.mock.calls).toStrictEqual([[]]);
    expect(adapterMock.startDiscovery.mock.calls).toStrictEqual([]);
    expect(adapterMock.stopDiscovery.mock.calls).toStrictEqual([[]]);
    expect(destroyMock.mock.calls).toStrictEqual([[]]);
  });
});
