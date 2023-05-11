import { db } from "./database";
import { RuuviId, RawEvent, RuuviTag, dtoRuuviTag, dtoRuuviData } from "./model";

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

function parseId(strId: string) {
  const found = strId.match(/\w{4}$/);
  if (found) {
    return found[0];
  }

  throw new Error("Cannot parse the ruuvi id");
}

export async function saveEvent(event: RawEvent) {
  const data = event.data;
  const ruuviId = parseId(event.data.mac);

  return db.tx(async (tx) => {
    await tx.none(SQL_INSERT_RUUVITAG, [ruuviId, event.data.mac]);
    await tx.none(SQL_INSERT_RUUVIEVENT, [
      ruuviId,
      data.version,
      event.datetime,
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
}

export async function getEvents(id: RuuviId) {
  return db.manyOrNone(SQL_GET_RUUVITAG_EVENTS, id).then((events) => events.map(dtoRuuviData));
}

export async function getTags(): Promise<RuuviTag[]> {
  return db.many(SQL_GET_RUUVITAGS).then((items) => items.map(dtoRuuviTag));
}
