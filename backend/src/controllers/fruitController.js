import { isMongoReady } from "../config/db.js";
import { fruits, recipes, sourceNotes } from "../data/fruitData.js";
import { Fruit } from "../models/Fruit.js";
import { SearchEvent } from "../models/SearchEvent.js";
import { recordMemorySearch } from "../services/analyticsStore.js";
import { getLiveNutrition } from "../services/nutritionService.js";
import { getTrendSignal } from "../services/trendService.js";

const fruitSource = async () => {
  if (isMongoReady()) {
    const stored = await Fruit.find().lean();
    if (stored && stored.length > 0) return stored;
  }
  return fruits;
};

const searchText = (fruit) =>
  [
    fruit.name,
    fruit.scientificName,
    ...(fruit.category || []),
    ...(fruit.originRegions || []),
    ...(fruit.productionRegions || []),
    ...(fruit.vitamins || []),
    ...(fruit.minerals || []),
    ...(fruit.benefits || [])
  ]
    .join(" ")
    .toLowerCase();

export const listFruits = async (req, res) => {
  const { q } = req.query;
  let data = await fruitSource();
  if (q) {
    const needle = q.toLowerCase();
    data = data.filter((fruit) => searchText(fruit).includes(needle));

    if (isMongoReady()) {
      await SearchEvent.create({
        query: q,
        userId: req.user?._id,
        region: req.user?.region || req.query.region,
        resultCount: data.length
      });
    } else {
      recordMemorySearch({ query: q, region: req.query.region, resultCount: data.length });
    }
  }

  return res.json({
    fruits: data.map((fruit) => ({
      ...fruit,
      trendSignal: { status: "unavailable", value: null, source: "No verified live data available" }
    })),
    sources: sourceNotes
  });
};

export const getFruit = async (req, res) => {
  let data = null;
  if (isMongoReady()) {
    data = await Fruit.findOne({ slug: req.params.slug }).lean();
  }
  if (!data) {
    data = fruits.find((fruit) => fruit.slug === req.params.slug);
  }

  if (!data) return res.status(404).json({ message: "Fruit not found" });

  const [nutritionResult, trendSignal] = await Promise.allSettled([
    getLiveNutrition(data.name),
    getTrendSignal(data.name)
  ]);

  const liveNutrition =
    nutritionResult.status === "fulfilled"
      ? { ...nutritionResult.value.value }
      : { source: "No verified live data available", status: "unavailable" };

  const fruitRecipes = recipes.filter((recipe) => recipe.fruitSlugs?.includes(data.slug));

  return res.json({
    fruit: {
      ...data,
      liveNutrition,
      trendSignal: trendSignal.status === "fulfilled" ? trendSignal.value : { status: "unavailable", value: null },
      recipes: fruitRecipes
    },
    sources: sourceNotes
  });
};

export const trendingFruits = async (_req, res) => {
  const data = await fruitSource();
  const trends = await Promise.all(data.slice(0, 12).map((fruit) => getTrendSignal(fruit.name).catch((error) => ({ status: "unavailable", value: null, error: error.message }))));
  return res.json({
    fruits: data
      .slice(0, 12)
      .map((fruit, index) => ({ ...fruit, trendSignal: trends[index] }))
      .sort((a, b) => (b.trendSignal?.value ?? -1) - (a.trendSignal?.value ?? -1)),
    sources: sourceNotes,
    note: "No verified live data available"
  });
};

export const history = async (_req, res) => {
  const data = await fruitSource();
  return res.json({
    history: data.map(({ slug, name, image, color, originRegions, culture, history }) => ({
      slug,
      name,
      image,
      color,
      origin: originRegions?.join(", "),
      culture,
      timeline: history
    }))
  });
};
