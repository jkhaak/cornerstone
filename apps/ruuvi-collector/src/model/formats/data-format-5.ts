import type { RuuviManufacturerId, DataFormatVersion, RuuviData } from "../ruuvi";

import type {
  Humidity,
  Pressure,
  Acceleration,
  Voltage,
  DBM,
  MovementCounter,
  MeasurementSequence,
  MACAddress,
} from "./ruuvi-fields";

export type Format = {
  manufacturerId: RuuviManufacturerId;
  version: DataFormatVersion;
  humidity: Humidity;
  pressure: Pressure;
  acceleration: Acceleration;
  power: Voltage;
  txPower: DBM;
  movementCounter: MovementCounter;
  measurementSequence: MeasurementSequence;
  mac: MACAddress;
};

export function parse(input: Buffer): RuuviData {
  return {
    manufacturerId: "499",
    version: 5
  } as RuuviData;
}
