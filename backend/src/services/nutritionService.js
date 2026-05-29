import { env } from "../config/env.js";
import { cache } from "./cacheService.js";
import { fetchJson } from "./httpService.js";

const nutrientMap = {
  1008: "calories",
  1003: "protein",
  1004: "fat",
  1005: "carbs",
  1079: "fiber",
  2000: "sugar",
  1162: "vitaminC",
  1106: "vitaminA",
  1185: "vitaminK",
  1092: "potassium",
  1087: "calcium",
  1089: "iron",
  1090: "magnesium"
};

const parseFood = (food) => {
  const nutrients = {};
  for (const nutrient of food.foodNutrients || []) {
    const id = nutrient.nutrientId || nutrient.nutrient?.id;
    const key = nutrientMap[id];
    if (key) nutrients[key] = nutrient.value ?? nutrient.amount;
  }
  return {
    fdcId: food.fdcId,
    description: food.description,
    dataType: food.dataType,
    publicationDate: food.publicationDate,
    nutrients,
    source: "USDA FoodData Central"
  };
};

export const getLiveNutrition = async (fruitName) => {
  const key = `nutrition:${fruitName.toLowerCase()}`;
  return cache.wrap(key, 24 * 60 * 60 * 1000, async () => {
    const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
    url.searchParams.set("api_key", env.usdaApiKey);
    url.searchParams.set("query", `${fruitName}, raw`);
    url.searchParams.set("dataType", "Foundation,SR Legacy,Survey (FNDDS)");
    url.searchParams.set("pageSize", "5");
    const data = await fetchJson(url);
    const food = (data.foods || []).find((item) => item.description?.toLowerCase().includes(fruitName.toLowerCase())) || data.foods?.[0];
    if (!food) return null;
    return parseFood(food);
  });
};
