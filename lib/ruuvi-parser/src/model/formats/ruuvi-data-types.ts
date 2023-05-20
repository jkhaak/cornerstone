import type { GetFormats, GetVersion } from "../utils";
import type { DecodedFormat as DecodedFormat5 } from "./data-format-5";

/**
 * Ruuvi manufacturer id. Id is 0x0499, which is transmitted as 0x9904.
 */
export type RuuviManufacturerId = "499";

/**
 * Temperature (16bit signed integer) in 0.005 degrees.
 *
 * Allowed range -32_757..32_767.
 */
export type Temperature = number;

/**
 * Humidity (16bit unsigned integer) in 0.0025% (0–163.83% range, though realistically
 * 0-100%).
 *
 * Allowed range is 0..40_000.
 */
export type Humidity = number;

/**
 * Pressure (16bit unsigned integer) in 1 Pa units, with offset of -50_000 Pa.
 *
 * Allowed range 0..65_534.
 */
export type Pressure = number;

/**
 * Acceleration (most significant Byte first). Allowed range -32_767..32_767.
 */
export type Acceleration = {
  x: AccelerationValue;
  y: AccelerationValue;
  z: AccelerationValue;
};

/**
 * Allowed range -32_767..32_767.
 */
export type AccelerationValue = number;

/**
 * Power info (11+5bit unsigned), first 11 bits is the battery voltage above 1.6V, in
 * millivolts (1.6V to 3.646V range). Last 5 bits unsigned are the TX power above
 * -40dBm, in 2dBm steps (-40dBm to +20dBM range).
 */
export type Power = {
  voltage: BatteryVoltage;
  tx: TxPower;
};

/**
 * Voltage above above 1.6V, in millivolts (1.6V to 3.646V range).
 *
 * Allowed range 0..2046.
 */
export type BatteryVoltage = number;

/**
 * TX Power above -40dBm, in 2dBm steps (-40dBm to +20dBM range).
 *
 * Allowed range 0..30.
 */
export type TxPower = number;

/**
 * Movement counter (8bit unsigned), incremented by motion detection interrupts from
 * accelerometer.
 *
 * Allowed range 0..256.
 */
export type MovementCounter = number;

/**
 * Measurement sequence number (16bit unsigned), each time a measurement is taken, this
 * is incremented by one, used for measurement de-duplication. Depending on the transmit
 * interval, multiple packets with the same mearusements can be sent, and there maybe
 * measurements that never were sent.
 *
 * Allowed range 0..65_534.
 */
export type MeasurementSequence = number;

/**
 * 48bit MAC address.
 */
export type MACAddress = string;

export type DataFormats = [5, DecodedFormat5];
export type DataFormatVersion = GetVersion<DataFormats>;
export type RuuviData = GetFormats<DataFormats>;
