import type { on, startScanningAsync, Advertisement } from "@abandonware/noble";
import * as ruuvi from "./model/ruuvi";
import logger from "./logger";

export type Noble = {
  on: typeof on;
  startScanningAsync: typeof startScanningAsync;
};

function peripheralToString({ id, advertisement }: { id: string; advertisement: Advertisement }) {
  const manufacturerDataHex = advertisement.manufacturerData
    ? Buffer.from(advertisement.manufacturerData).toString("hex")
    : undefined;

  const manufacturerData: Buffer | undefined = advertisement?.manufacturerData;

  const info = {
    id,
    localName: advertisement.localName,
    datetime: new Date(),
    manufacturerDataHex,
  };

  if (manufacturerData === undefined) {
    logger.debug({ ...info, error: `manufacturerData is undefined` });
    return;
  }

  const data = ruuvi.safeParse(advertisement.manufacturerData);

  if (data.type === "error") {
    if (data.message === "Unknown manufacturer id") {
      logger.debug({ ...info, error: data.message });
      return;
    }
    logger.error({ ...info, error: data.message });
    return;
  }

  return { ...info, data: data.value };
}

export function ruuviCollector({ noble }: { noble: Noble }) {
  noble.on("stateChange", async (state: string) => {
    logger.info({ message: `Noble state changed to: ${state}` });
    if (state === "poweredOn") {
      await noble.startScanningAsync([], false);
    }
  });

  noble.on("discover", async (peripheral) => {
    const data = peripheralToString(peripheral);
    if (data) {
      logger.info({ peripheral: data });
    }
  });
}
