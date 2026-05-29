import { fruits, recipes } from "../data/fruitData.js";
import { isMongoReady } from "../config/db.js";
import { SearchEvent } from "../models/SearchEvent.js";
import { User } from "../models/User.js";
import { getMemoryAnalytics } from "../services/analyticsStore.js";

export const analyticsOverview = async (_req, res) => {
  if (isMongoReady()) {
    const searches = await SearchEvent.aggregate([
      { $group: { _id: "$query", count: { $sum: 1 }, lastSearched: { $max: "$createdAt" } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);
    const usersByRegion = await User.aggregate([
      { $group: { _id: "$region", users: { $sum: 1 } } },
      { $sort: { users: -1 } }
    ]);
    return res.json({
      totals: {
        fruits: fruits.length,
        recipes: recipes.length,
        searches: searches.reduce((sum, item) => sum + item.count, 0),
        activeUsers: await User.countDocuments()
      },
      searches,
      usersByRegion,
      popularRecipes: [],
      healthTrends: [],
      source: "MongoDB SearchEvent and User collections",
      note: "No verified live data available"
    });
  }

  const analytics = getMemoryAnalytics();
  analytics.totals.fruits = fruits.length;
  analytics.totals.recipes = recipes.length;
  analytics.popularRecipes = [];
  analytics.healthTrends = [];
  return res.json(analytics);
};
