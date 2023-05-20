import type { on, startScanningAsync, Advertisement } from "@abandonware/noble";

export type Event = {
  manufacturerDataBase64: string;
};

export type Noble = {
  on: typeof on;
  startScanningAsync: typeof startScanningAsync;
};

export type NobleAdvertisement = {
  id: string;
  advertisement: Advertisement;
};
