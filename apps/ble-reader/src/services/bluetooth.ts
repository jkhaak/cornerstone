import { createBluetooth as nodeBleCreateBluetooth } from "node-ble";
import { logger } from "@cornerstone/core";
import type NodeBle from "node-ble";
import type { Adapter, Device } from "node-ble";
import EventEmitter from "node:events";
import { environment } from "@cornerstone/core";
import { errorHandler } from "../util/error-handler";
import { setTimeout, setInterval } from "node:timers";

/**
 * Device checking interval in milliseconds.
 */
const DEVICE_CHECK_INTERVAL = 5 * 60 * 1000;

export type NewDeviceEventParams = [string, Device];

export class Bluetooth extends EventEmitter {
  private _bluetooth: NodeBle.Bluetooth;
  private _destroy: () => void;

  private _deviceIds: string[] = [];
  private _adapter: Adapter | undefined;

  private _checkDevicesTimer: NodeJS.Timer | undefined;
  private _currentCheckInterval: number = 1;

  public constructor(bluetooth: NodeBle.Bluetooth, destroy: () => void) {
    super();
    this._bluetooth = bluetooth;
    this._destroy = destroy;
  }

  public static init(): Bluetooth {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { bluetooth, destroy } = nodeBleCreateBluetooth();
    return new Bluetooth(bluetooth, destroy);
  }

  public async startDiscovery() {
    const adapter = await this.getAdapter();
    if (!(await adapter.isDiscovering())) {
      logger.debug({ message: "start discovering" });
      await adapter.startDiscovery();
    }
    return this;
  }

  public startDeviceDiscovery() {
    this._startDeviceChecking();
  }

  public async stopDiscovery() {
    const adapter = await this.getAdapter();
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

  private _startDeviceChecking() {
    if (this._checkDevicesTimer) {
      logger.debug({ message: "device checking already running. do nothing." });
      return;
    }

    this._checkDevicesTimer = setTimeout(
      () => this._startExponentialBackoffChecking(),
      this._currentCheckInterval * 1000
    );
  }

  private async _stopDeviceChecking() {
    if (!this._checkDevicesTimer) {
      logger.debug({ message: "device checking already stopped. do nothing." });
      return;
    }
    clearInterval(this._checkDevicesTimer);
    this._checkDevicesTimer = undefined;
  }

  private _startExponentialBackoffChecking() {
    logger.info({ message: "Checking for new devices", intervalInSeconds: this._currentCheckInterval });
    this._checkDevices().catch(
      errorHandler(`bluetooth.${this._startExponentialBackoffChecking.name}.setInterval`)
    );

    this._currentCheckInterval = this._currentCheckInterval * 2;

    if (this._currentCheckInterval < DEVICE_CHECK_INTERVAL) {
      this._checkDevicesTimer = setTimeout(
        () => this._startExponentialBackoffChecking(),
        this._currentCheckInterval * 1000
      );
    } else {
      this._checkDevicesTimer = setInterval(() => {
        this._checkDevices().catch(errorHandler(`bluetooth.${this._startDeviceChecking.name}.setInterval`));
      }, DEVICE_CHECK_INTERVAL);
    }
  }

  private async _checkDevices(): Promise<void> {
    const adapter = await this.getAdapter();
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
  }

  public async getAdapter(): Promise<Adapter> {
    if (this._adapter) {
      return this._adapter;
    }

    const bluetoothAdapter = environment.getEnv("BLUETOOTH_ADAPTER")?.toLowerCase();

    if (!bluetoothAdapter) {
      // use default
      this._adapter = await this._bluetooth.defaultAdapter();
    } else {
      logger.info({ message: "trying to find configured bluetooth adapter" });
      const adapterNames: string[] = await this._bluetooth.adapters();
      const lowerCaseAdapterNames = adapterNames.map((adapterName) => adapterName.toLowerCase());
      if (lowerCaseAdapterNames.includes(bluetoothAdapter)) {
        // check if adapter name is device name
        this._adapter = await this._bluetooth.getAdapter(bluetoothAdapter);
      } else {
        // check if adapter name is a mac address
        const adapters = (
          await Promise.all(
            adapterNames
              .map(async (name) => ({ name, adapter: await this._bluetooth.getAdapter(name) }))
              .map(async (adapterPromise) => {
                const { name, adapter } = await adapterPromise;
                return { name, adapter, mac: await adapter.getAddress() };
              })
          )
        ).filter((adapter) => adapter.mac.toLowerCase() === bluetoothAdapter);

        const adapter = adapters.length > 0 ? adapters[0] : undefined;

        if (adapter) {
          this._adapter = adapter.adapter;
        } else {
          logger.error({ message: `adapter '${bluetoothAdapter}' could not be found` });
          throw new Error("Adapter not found");
        }
      }
      logger.info({ message: "found the bluetooth adapter", bluetoothAdapter });
    }
    return this._adapter;
  }
}
