import { MemoryCache } from "memory-cache-node";

class CacheManager {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _caches: Record<string, MemoryCache<any, any>>;

  public constructor() {
    this._caches = {};
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public createCache<T extends MemoryCache<K, V>, K extends any = any, V extends any = any>(
    name: string,
    itemsExpirationCheckInterval: number = 600,
    maxItemCount: number = 1000
  ): T {
    let cache = this._caches[name];

    if (!cache) {
      cache = new MemoryCache<K, V>(itemsExpirationCheckInterval, maxItemCount);
      this._caches[name] = cache;
    }

    return cache as T;
  }

  public destroyCaches() {
    Object.entries(this._caches).forEach(([__name, cache]) => {
      cache.destroy();
    });
  }

  public clearCaches() {
    Object.entries(this._caches).forEach(([__name, cache]) => {
      cache.clear();
    });
  }
}

const cacheManager = new CacheManager();

export { cacheManager };
