import { env } from "../config/env.js";
import { cache } from "./cacheService.js";
import { fetchJson } from "./httpService.js";

export const getTrendSignal = async (fruitName) => {
  if (!env.googleTrendsApiUrl) {
    return {
      status: "unavailable",
      value: null,
      source: "No verified live data available",
      explanation: "No verified live data available"
    };
  }

  const key = `trend:${fruitName.toLowerCase()}`;
  const { value } = await cache.wrap(key, 6 * 60 * 60 * 1000, async () => {
    const url = new URL(env.googleTrendsApiUrl);
    url.searchParams.set("q", fruitName);
    const data = await fetchJson(url, {
      headers: env.googleTrendsApiKey ? { authorization: `Bearer ${env.googleTrendsApiKey}` } : {}
    });
    return {
      status: "verified",
      value: data.score ?? data.interest ?? null,
      source: "Configured Google Trends API",
      refreshedAt: new Date().toISOString()
    };
  });
  return value;
};
