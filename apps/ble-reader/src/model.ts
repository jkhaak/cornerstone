import type { on, startScanningAsync, Peripheral } from "@abandonware/noble";

export type Event = {
  manufacturerDataBase64: string;
};

export type Noble = {
  on: typeof on;
  startScanningAsync: typeof startScanningAsync;
};

export type DiscoveryData =
  | {
      peripheral: Peripheral;
      manufacturerData: Buffer;
    }
  | undefined;
