const memorySearches = [];

export const recordMemorySearch = ({ query, region, resultCount }) => {
  memorySearches.push({
    query,
    region: region || "Unknown",
    resultCount,
    createdAt: new Date().toISOString()
  });
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
