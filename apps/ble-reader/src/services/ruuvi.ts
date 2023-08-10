import { logger } from "@cornerstone/core";
import { DBusError } from "dbus-next";
import type { Device } from "node-ble";
import { errorHandler } from "../util/error-handler";
import { ruuvi } from "@cornerstone/ruuvi-parser";
import type { RuuviData } from "@cornerstone/ruuvi-parser";

/**
 * Check interval in milliseconds.
 */
const CHECK_INTERVAL = 5 * 1000;

export type EventHandler = (obj: object) => void;

export class RuuviService {
  private _endpoint: EventHandler;
  private _timers: [string, NodeJS.Timer][] = [];

  public constructor() {
    this._endpoint = () => {
      throw new Error("endpoint is not set");
    };
  }

  private async _propToEvent(prop: unknown): Promise<RuuviData> {
    const prefix = Buffer.from("9904", "hex");
    // Using undocumented node-ble API
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    const data = (prop as any)["1177"].value as Buffer;

    return ruuvi.decodeAsync(Buffer.concat([prefix, data]));
  }

  private async _ruuviTagListener(deviceId: string, device: Device) {
    // Using undocumented node-ble API
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
    const prop: unknown = await (device as any).helper.waitPropChange("ManufacturerData");
    const event = await this._propToEvent(prop);

    logger.info({ message: "sending event", deviceId });

    this._endpoint(event);
  }

  public setEndpoint(endpoint: EventHandler) {
    this._endpoint = endpoint;
  }

  public listDevices() {
    return this._timers.map(([alias]) => alias);
  }

  public stopTimers() {
    const timers = this._timers;
    this._timers = [];
    timers.forEach(([, timer]) => clearInterval(timer));
  }

  public handleNewDevice(deviceId: string, device: Device) {
    device
      .getAlias()
      .then((alias) => {
        if (alias.startsWith("Ruuvi")) {
          logger.info({ message: "start listener for ruuvi tag", deviceId, alias });

          const timer = setInterval(() => {
            this._ruuviTagListener(deviceId, device).catch(
              errorHandler(`ruuvi.${this.handleNewDevice.name}`)
            );
          }, CHECK_INTERVAL);

          this._timers.push([alias, timer]);
        }
        // ignore device
      })
      .catch((error: unknown) => {
        if (error instanceof DBusError && error.text.match(/No such property 'Name'/)) {
          logger.debug({ message: "device doesn't have a name", deviceId });
        } else {
          logger.error({ message: "unexpected error while getting the name of the device", deviceId, error });
        }
      });
  }
}
