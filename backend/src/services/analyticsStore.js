const memorySearches = [
  { query: "kiwi", region: "India", resultCount: 1, createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { query: "mango", region: "India", resultCount: 1, createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
  { query: "avocado", region: "Global", resultCount: 1, createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString() }
];

export const recordMemorySearch = ({ query, region, resultCount, userId }) => {
  memorySearches.push({
    query,
    userId: userId || null,
    region: region || "Unknown",
    resultCount: resultCount || 1,
    createdAt: new Date().toISOString()
  });
};

export const getRecentMemorySearches = (limit = 8) => {
  const seen = new Set();
  const list = [];
  for (let i = memorySearches.length - 1; i >= 0; i--) {
    const q = memorySearches[i].query;
    if (q && !seen.has(q.toLowerCase())) {
      seen.add(q.toLowerCase());
      list.push(q);
      if (list.length >= limit) break;
    }
  }
  return list;
};

export const getMemoryAnalytics = () => {
  const searchGroups = new Map();
  const regionGroups = new Map();
  for (const search of memorySearches) {
    searchGroups.set(search.query, (searchGroups.get(search.query) || 0) + 1);
    regionGroups.set(search.region, (regionGroups.get(search.region) || 0) + 1);
  }

  return {
    totals: {
      fruits: null,
      recipes: null,
      searches: memorySearches.length,
      activeUsers: null
    },
    searches: [...searchGroups.entries()].map(([query, count]) => ({ _id: query, count })).sort((a, b) => b.count - a.count),
    usersByRegion: [...regionGroups.entries()].map(([region, users]) => ({ _id: region, users })).sort((a, b) => b.users - a.users),
    source: "Current in-memory server session",
    note: "No verified live data available"
  };
};
