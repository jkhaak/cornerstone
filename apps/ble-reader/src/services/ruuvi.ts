import { logger } from "@cornerstone/core";
import { DBusError } from "dbus-next";
import type { Device } from "node-ble";
import type { Event } from "./endpoint";
import { errorHandler } from "../util/error-handler";

/**
 * Check interval in milliseconds.
 */
const CHECK_INTERVAL = 5 * 1000;

export class RuuviService {
  private _endpoint: (event: Event) => void;
  private _timers: [string, NodeJS.Timer][] = [];

  public constructor() {
    this._endpoint = () => {
      throw new Error("endpoint is not set");
    };
  }

  private _propToEvent(prop: unknown): Event {
    const prefix = Buffer.from("9904", "hex");
    // Using undocumented node-ble API
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    const data = (prop as any)["1177"].value as Buffer;

    return {
      manufacturerDataBase64: Buffer.concat([prefix, data]).toString("base64"),
    };
  }

  private async _ruuviTagListener(deviceId: string, device: Device) {
    // Using undocumented node-ble API
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
    const prop: unknown = await (device as any).helper.waitPropChange("ManufacturerData");
    const event = this._propToEvent(prop);

    logger.info({ message: "sending event", deviceId });

    this._endpoint(event);
  }

  public setEndpoint(endpoint: (event: Event) => void) {
    this._endpoint = endpoint;
  }

  public listDevices() {
    return this._timers.map(([alias]) => alias);
  }

  public stopTimers() {
    this._timers.forEach(([__, timer]) => clearInterval(timer));
    this._timers = [];
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
