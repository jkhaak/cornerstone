import type { on, startScanningAsync, Advertisement } from "@abandonware/noble";
import logger from "./logger";

export type Noble = {
  on: typeof on;
  startScanningAsync: typeof startScanningAsync;
};

function peripheralToString({ id, advertisement }: { id: string; advertisement: Advertisement }) {
  const manufacturerData = advertisement.manufacturerData
    ? Buffer.from(advertisement.manufacturerData).toString("hex")
    : undefined;
  return `${id}:${advertisement.localName}:${manufacturerData}:${JSON.stringify(advertisement.serviceData)}`;
}

export function ruuviCollector({ noble }: { noble: Noble }) {
  noble.on("stateChange", async (state: string) => {
    logger.info({ message: `Noble state changed to: ${state}` });
    if (state === "poweredOn") {
      await noble.startScanningAsync([], false);
    }
  });

  noble.on("discover", async (peripheral) => {
    logger.info({ peripheral: peripheralToString(peripheral) });
    // await noble.stopScanningAsync();
    // await peripheral.connectAsync();
    // const {characteristics} = await peripheral.discoverSomeServicesAndCharacteristicsAsync(['180f'], ['2a19']);
    // const batteryLevel = (await characteristics[0].readAsync())[0];

    // await peripheral.disconnectAsync();
    // process.exit(0);
  });
}
