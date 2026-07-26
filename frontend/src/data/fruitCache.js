/**
 * Lightweight fruit data cache backed by sessionStorage.
 *
 * - Data persists across in-tab navigations (SPA route changes)
 * - Cleared when the tab/window closes (sessionStorage behavior)
 * - 5-minute TTL — stale data can still be shown while refreshing
 */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const buildKey = (key) => `fruitora_cache_${key}`;

/**
 * Store fruit data in the cache.
 * @param {string} key - cache key (e.g. "trending", "all")
 * @param {any} data - the data to cache
 */
export const setCachedFruits = (key, data) => {
  try {
    const entry = { data, timestamp: Date.now() };
    sessionStorage.setItem(buildKey(key), JSON.stringify(entry));
  } catch {
    // sessionStorage full or unavailable — silently skip
  }
};

/**
 * Retrieve cached fruit data. Returns null if no cache exists.
 * @param {string} key - cache key
 * @returns {any|null} - the cached data, or null
 */
export const getCachedFruits = (key) => {
  try {
    const raw = sessionStorage.getItem(buildKey(key));
    if (!raw) return null;
    const entry = JSON.parse(raw);
    return entry.data ?? null;
  } catch {
    return null;
  }
};

/**
 * Check whether cached data is still within TTL.
 * @param {string} key - cache key
 * @returns {boolean} - true if cache exists and is fresh
 */
export const isCacheValid = (key) => {
  try {
    const raw = sessionStorage.getItem(buildKey(key));
    if (!raw) return false;
    const entry = JSON.parse(raw);
    return Date.now() - entry.timestamp < CACHE_TTL_MS;
  } catch {
    return false;
  }
};
