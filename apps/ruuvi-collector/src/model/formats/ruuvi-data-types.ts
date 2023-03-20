import type { GetFormats, GetVersion } from "../utils";
import type { Format as DataFormat5 } from "./data-format-5";

export type RuuviManufacturerId = "499";
export type Humidity = {};
export type Pressure = {};
export type Acceleration = {};
export type Power = {
  voltage: Voltage;
  tx: DBM;
};
export type Voltage = {};
export type DBM = {};
export type MovementCounter = {};
export type MeasurementSequence = {};
export type MACAddress = {};

export type DataFormats = [5, DataFormat5];
export type DataFormatVersion = GetVersion<DataFormats>;
export type RuuviData = GetFormats<DataFormats>;
