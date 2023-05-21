import type noble = require("@abandonware/noble");
import { logger } from "@cornerstone/core";
import { differenceInSeconds } from "date-fns";
import { setTimeout } from "timers/promises";

export type ConnectionState =
  | { state: "disconnected" }
  | { state: "connecting"; started: Date; peripheral: noble.Peripheral }
  | { state: "connected"; started: Date; peripheral: noble.Peripheral };

type ConnStatus = { status: "timeout" } | { status: "success" };

function createTagId(id: string) {
  return id.toLowerCase().slice(-4);
}

export class RuuviTagConnectionManager {
  private _id: string;
  private _connState: ConnectionState;

  public constructor(id: string) {
    this._id = id;
    this._connState = { state: "disconnected" };
    return this;
  }

  public getId() {
    return this._id;
  }

  public getState() {
    return this._connState.state;
  }

  public async connect(peripheral: noble.Peripheral) {
    const ruuviTagId = this._id;
    if (createTagId(peripheral.id) !== this._id) {
      logger.debug({ __filename, message: "not my peripheral", myId: this._id, otherId: peripheral.id });
      return;
    }

    switch (this._connState.state) {
      case "disconnected":
        logger.info({ __filename, message: "attempting to connect to peripheral", ruuviTagId });
        this._connState = { state: "connecting", started: new Date(), peripheral };

        Promise.race([
          peripheral.connectAsync().then((): ConnStatus => ({ status: "success" })),
          setTimeout(30 * 1000).then((): ConnStatus => ({ status: "timeout" })),
        ])
          .then((connStatus) => {
            if (connStatus.status === "success") {
              logger.info({
                __filename,
                message: "succesfully connected to peripheral",
                ruuviTagId,
              });
              this._connState = { state: "connected", started: new Date(), peripheral };
            } else {
              logger.warn({ __filename, message: "connection timed out", ruuviTagId });
              this._connState = { state: "disconnected" };
            }
          })
          .catch((error: unknown) =>
            logger.error({
              __filename,
              message: "unknown error during connection to peripheral",
              error,
              ruuviTagId,
            })
          );

        break;
      case "connecting":
        if (differenceInSeconds(new Date(), this._connState.started) >= 60) {
          logger.warn({
            __filename,
            message: "been trying to connect to periheral too long aborting...",
            ruuviTagId,
          });
          await this.disconnect();
        }
        break;
      case "connected":
      default:
        logger.debug({ __filename, message: "nothing to do.", ruuviTagId });
    }
  }

  public async disconnect() {
    if (this._connState.state !== "disconnected") {
      const peripheral = this._connState.peripheral;
      const peripheralId = peripheral.id;
      this._connState = { state: "disconnected" };
      peripheral
        .disconnectAsync()
        .then(() => logger.info({ __filename, message: "disconnected succesfully" }))
        .catch((error: unknown) =>
          logger.error({ __filename, message: "error during disconnection", peripheralId, error })
        );
    }
  }
}
