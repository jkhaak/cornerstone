import { createBluetooth as nodeBleCreateBluetooth } from "node-ble";
import { logger } from "@cornerstone/core";
import type NodeBle from "node-ble";
import type { Adapter } from "node-ble";
import EventEmitter from "node:events";
import { setTimeout } from "node:timers/promises";
import { randOffset } from "./timer";

/**
 * Device checking interval in milliseconds.
 */
const DEVICE_CHECK_INTERVAL = 10 * 60 * 1000;

export class Bluetooth extends EventEmitter {
  private _bluetooth: NodeBle.Bluetooth;
  private _destroy: () => void;

  private _deviceIds: string[] = [];
  private _timerOn: boolean = false;
  private _adapter: Adapter | undefined;

  public constructor(bluetooth: NodeBle.Bluetooth, destroy: () => void) {
    super();
    this._bluetooth = bluetooth;
    this._destroy = destroy;
  }

  public async startDiscovery() {
    const adapter = await this._getAdapter();
    if (!(await adapter.isDiscovering())) {
      logger.debug({ message: "start discovering" });
      await adapter.startDiscovery();
      await this._startDeviceChecking();
    }
    return this;
  }

  public async stopDiscovery() {
    const adapter = await this._getAdapter();
    if (await adapter.isDiscovering()) {
      logger.debug({ message: "stop discoveryng" });
      await this._stopDeviceChecking();
      await adapter.stopDiscovery();
    }
    return this;
  }

  public async destroy() {
    logger.debug({ message: "destroy bluetooth" });
    await this.stopDiscovery();
    this._destroy();
  }

  private async _startDeviceChecking() {
    if (this._timerOn) {
      logger.debug({ message: "device checking already running. do nothing." });
      return;
    }
    this._timerOn = false;

    void this._checkDevices()
      .then(() => setTimeout(5000 + randOffset(1000)))
      .then(() => this._checkDevices())
      .then(() => setTimeout(5000 + randOffset(1000)))
      .then(() => {
        this._timerOn = true;
        return this._checkDevices();
      });
  }

  private async _stopDeviceChecking() {
    if (!this._timerOn) {
      logger.debug({ message: "device checking already stopped. do nothing." });
      return;
    }
    this._timerOn = false;

    // wait for timer to drain out
    await setTimeout(DEVICE_CHECK_INTERVAL * 1.1);
  }

  private async _checkDevices(): Promise<void> {
    const adapter = await this._getAdapter();
    const deviceIds = await adapter.devices();
    const newDeviceIds = deviceIds.filter((devId) => !this._deviceIds.includes(devId));

    if (newDeviceIds.length > 0) {
      logger.info({ message: "found new devices", count: newDeviceIds.length, newDeviceIds });
    }

    // emit event per new device
    await Promise.all(
      newDeviceIds.map(async (devId) => {
        const device = await adapter.getDevice(devId);
        this.emit("newDevice", devId, device);
      })
    );
    this._deviceIds = [...this._deviceIds, ...newDeviceIds];

    // set new check
    if (this._timerOn) {
      void setTimeout(DEVICE_CHECK_INTERVAL + randOffset(60 * 1000)).then(() => this._checkDevices());
    }
  }

  private async _getAdapter(): Promise<Adapter> {
    if (this._adapter === undefined) {
      this._adapter = await this._bluetooth.defaultAdapter();
    }

    return this._adapter;
  }
}

export function createBluetooth() {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { bluetooth, destroy } = nodeBleCreateBluetooth();
  const bt = new Bluetooth(bluetooth, destroy);

  return bt;
}
