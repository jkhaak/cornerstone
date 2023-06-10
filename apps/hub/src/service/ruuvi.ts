import { db } from "../database";
import { RuuviId, RuuviTag, dtoRuuviTag, dtoRuuviData, RuuviEvent } from "../model/ruuvi";
import * as mqtt from "./mqtt";
import _ from "lodash";

const SQL_GET_RUUVITAGS = `
select *
from ruuvitag
`;

const SQL_GET_RUUVITAG_EVENTS = `
select id
     , ruuvitag
     , "version"
     , datetime
     , temperature
     , humidity
     , pressure
     , acceleration_x
     , acceleration_y
     , acceleration_z
     , power_voltage
     , power_tx
     , movement_counter
     , measurement_sequence
from public.ruuvidata
where ruuvitag = $1
`;

const SQL_INSERT_RUUVITAG = `
insert into ruuvitag
(id, mac)
values($1, $2)
on conflict (id) do nothing
`;

const SQL_INSERT_RUUVIEVENT = `
insert into public.ruuvidata (ruuvitag
                            , "version"
                            , datetime
                            , temperature
                            , humidity
                            , pressure
                            , acceleration_x
                            , acceleration_y
                            , acceleration_z
                            , power_voltage
                            , power_tx
                            , movement_counter
                            , measurement_sequence)
values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
`;

function calcBatteryLevel(voltage: number): number {
  const value = _.round(((voltage - 1.6) / 1.4) * 100);
  return _.clamp(value, 0, 100);
}

export function publishMqttEvents({ data, ruuviId }: RuuviEvent) {
  const { pressure, humidity, temperature } = data;

  const dump = {
    ruuviId,
    pressure: _.clamp(pressure, 700, 1100),
    humidity: _.clamp(humidity, 0, 100),
    temperature,
    batteryLevel: calcBatteryLevel(data.power.voltage),
  };

  mqtt.publish(`ruuvi/${ruuviId}/get`, JSON.stringify(dump));
}

export async function saveEvent({ data, ruuviId }: RuuviEvent): Promise<RuuviId> {
  const datetime = new Date();

  await db.tx(async (tx) => {
    await tx.none(SQL_INSERT_RUUVITAG, [ruuviId, data.mac]);
    await tx.none(SQL_INSERT_RUUVIEVENT, [
      ruuviId,
      data.version,
      datetime,
      data.temperature,
      data.humidity,
      data.pressure,
      data.acceleration.x,
      data.acceleration.y,
      data.acceleration.z,
      data.power.voltage,
      data.power.tx,
      data.movementCounter,
      data.measurementSequence,
    ]);
  });

  return ruuviId satisfies RuuviId;
}

export function handle(data: RuuviEvent): Promise<RuuviId> {
  publishMqttEvents(data);
  return saveEvent(data);
}

export async function getEvents(id: RuuviId) {
  return db.manyOrNone(SQL_GET_RUUVITAG_EVENTS, id).then((events) => events.map(dtoRuuviData));
}

export async function getTags(): Promise<RuuviTag[]> {
  return db.manyOrNone(SQL_GET_RUUVITAGS).then((items) => items.map(dtoRuuviTag));
}
