import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@cornerstone/hub";

export type Event = {
  manufacturerDataBase64: string;
};

export class Endpoint {
  private _trpc: ReturnType<typeof createTRPCProxyClient<AppRouter>>;

  public constructor(endpoint: string) {
    this._trpc = createTRPCProxyClient<AppRouter>({
      links: [httpBatchLink({ url: endpoint })],
    });
  }

  public sendEvent(event: Event) {
    return this._trpc.ruuviSave.mutate(event);
  }
}
