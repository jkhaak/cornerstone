export type RuuviManufacturerId = "499";
export type RuuviVersion = 5;
export type Humidity = {};
export type Pressure = {};
export type Acceleration = {};
export type Voltage = {};
export type DBM = {};
export type MovementCounter = {};
export type MeasurementSequence = {};
export type MACAddress = {};

export type DataFormat5 = {
  manufacturerId: RuuviManufacturerId;
  version: RuuviVersion;
  humidity: Humidity;
  pressure: Pressure;
  acceleration: Acceleration;
  power: Voltage;
  txPower: DBM;
  movementCounter: MovementCounter;
  measurementSequence: MeasurementSequence;
  mac: MACAddress;
};

export type Either<T> = { type: "ok"; value: T } | { type: "error"; message: string };

export type RuuviData = DataFormat5;

const ruuviManufacturerId = "499" satisfies RuuviManufacturerId;

function parseDataFormat5(input: Buffer): Partial<RuuviData> {
  return {
    manufacturerId: "499",
    version: 5
  };
}

function safeParse(input: Buffer): Either<RuuviData> {
  const manufacturerId = input.readInt16LE(0).toString(16);
  if (manufacturerId !== ruuviManufacturerId) {
    return { type: "error", message: "Unknown manufacturer id" };
  }

  return {
    type: "ok",
    value: parseDataFormat5(input) as RuuviData
  };
}

export function parseGraceful(input: Buffer): RuuviData | undefined {
  const either = safeParse(input);

  if (either.type === "error") {
    console.log(either.message);
    return undefined;
  }

  return either.value;
}

export function parse(input: Buffer): RuuviData {
  const either = safeParse(input);

  if (either.type === "error") {
    throw new Error(either.message);
  }

  return either.value;
}
