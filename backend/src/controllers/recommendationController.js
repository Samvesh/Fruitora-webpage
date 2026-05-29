import { fruits, recipes } from "../data/fruitData.js";
import { isMongoReady } from "../config/db.js";
import { Fruit } from "../models/Fruit.js";
import { Recipe } from "../models/Recipe.js";

const loadFruits = async () => (isMongoReady() ? Fruit.find().lean() : fruits);
const loadRecipes = async () => (isMongoReady() ? Recipe.find().lean() : recipes);

export const recipeRecommendations = async (req, res) => {
  const { diet = "", region = "", allergies = "" } = req.query;
  const allergyList = allergies.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  const data = await loadRecipes();

  const scored = data.map((recipe) => {
    let score = 50;
    if (diet && recipe.diet?.some((item) => item.toLowerCase().includes(diet.toLowerCase()))) score += 25;
    if (region && recipe.region?.some((item) => item.toLowerCase().includes(region.toLowerCase()))) score += 15;
    if (allergyList.some((allergy) => recipe.avoidAllergies?.includes(allergy))) score += 10;
    return { ...recipe, score };
  });

  return res.json({ recipes: scored.sort((a, b) => b.score - a.score) });
};

export const healthRecommendations = async (req, res) => {
  const profile = req.body || {};
  const allergyText = (profile.allergies || []).join(" ").toLowerCase();
  const conditions = (profile.healthConditions || []).join(" ").toLowerCase();
  const goals = (profile.fitnessGoals || []).join(" ").toLowerCase();
  const data = await loadFruits();

  const suitable = data
    .map((fruit) => {
      let score = 60;
      const profileText = `${conditions} ${goals}`;
      if (profileText.includes("heart") && ["pomegranate", "avocado", "blueberry"].includes(fruit.slug)) score += 22;
      if (profileText.includes("fitness") && ["banana", "mango", "avocado"].includes(fruit.slug)) score += 18;
      if (profileText.includes("weight") && (fruit.nutrition?.calories ?? 999) < 70) score += 16;
      if (profileText.includes("diabetes") && (fruit.nutrition?.sugar ?? 99) < 11) score += 14;
      if (allergyText && fruit.allergies?.join(" ").toLowerCase().includes(allergyText)) score -= 80;
      return { ...fruit, score };
    })
    .sort((a, b) => b.score - a.score);

  const avoid = suitable.filter((fruit) => fruit.score < 35).map((fruit) => fruit.name);

  return res.json({
    suitable: suitable.slice(0, 4),
    avoid,
    dailyGuidance: [
      "Build a 2 to 3 fruit-serving rhythm around fiber, hydration, and micronutrient variety.",
      "Pair higher-sugar fruits with protein or healthy fat when stable energy is a goal.",
      "Rotate colors through the week for broader phytochemical coverage."
    ],
    quantitySuggestions: suitable.slice(0, 4).map((fruit) => ({ fruit: fruit.name, amount: fruit.serving || "One moderate serving" }))
  });
};
