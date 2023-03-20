import type { DataFormatVersion, RuuviData } from "./ruuvi-data-types";

import type {
  RuuviManufacturerId,
  Temperature,
  Humidity,
  Pressure,
  Acceleration,
  Power,
  MovementCounter,
  MeasurementSequence,
  MACAddress,
} from "./ruuvi-data-types";

export type Format = {
  manufacturerId: RuuviManufacturerId;
  temperature: Temperature;
  version: DataFormatVersion;
  humidity: Humidity;
  pressure: Pressure;
  acceleration: Acceleration;
  power: Power;
  movementCounter: MovementCounter;
  measurementSequence: MeasurementSequence;
  mac: MACAddress;
};

export function parse(input: Buffer): RuuviData {
  return {
    manufacturerId: "499",
    version: 5,
    temperature: 0,
    humidity: 0,
    pressure: 0,
    acceleration: { x: 0, y: 0, z: 0 },
    power: {
      voltage: 0,
      tx: 0,
    },
    movementCounter: 0,
    measurementSequence: 0,
    mac: "",
  };
}
