const store = new Map();

export const cache = {
  get(key) {
    const hit = store.get(key);
    if (!hit) return null;
    if (Date.now() > hit.expiresAt) {
      store.delete(key);
      return null;
    }
    return hit.value;
  },
  set(key, value, ttlMs) {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  },
  wrap: async (key, ttlMs, loader) => {
    const hit = cache.get(key);
    if (hit) return { value: hit, cache: "hit" };
    const value = await loader();
    cache.set(key, value, ttlMs);
    return { value, cache: "miss" };
  }
};
