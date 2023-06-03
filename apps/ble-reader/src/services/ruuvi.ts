import { logger } from "@cornerstone/core";
import { DBusError } from "dbus-next";
import type { Device } from "node-ble";
import type { Endpoint } from "./endpoint";
import type { Event } from "./endpoint";
import { errorHandler } from "../util/error-handler";

/**
 * Check interval in milliseconds.
 */
const CHECK_INTERVAL = 60 * 1000;

export class RuuviService {
  private _endpoint: Endpoint;
  private _timers: [string, NodeJS.Timer][] = [];

  public constructor(endpoint: Endpoint) {
    this._endpoint = endpoint;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _propToEvent(prop: any): Event {
    const prefix = Buffer.from("9904", "hex");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const data = prop["1177"].value as Buffer;

    return {
      manufacturerDataBase64: Buffer.concat([prefix, data]).toString("base64"),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async _ruuviTagListener(deviceId: string, device: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const prop: unknown = await device.helper.waitPropChange("ManufacturerData");
    const event = this._propToEvent(prop);

    logger.info({ message: "sending event", deviceId });

    await this._endpoint.sendEvent(event);
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
