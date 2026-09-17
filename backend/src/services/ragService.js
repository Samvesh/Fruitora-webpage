import { isMongoReady } from "../config/db.js";
import { fruits, recipes } from "../data/fruitData.js";
import { Fruit } from "../models/Fruit.js";
import { SearchEvent } from "../models/SearchEvent.js";
import { User } from "../models/User.js";

/**
 * Retrieve user health profile, goals, favorites, and recent search history
 */
export async function getUserContext(userId) {
  if (!userId) {
    return { isGuest: true, note: "Guest user (no saved profile or goals)" };
  }

  try {
    if (!isMongoReady()) {
      return { isGuest: false, note: "Local storage mode active" };
    }

    const [user, recentSearches] = await Promise.all([
      User.findById(userId).select("name region healthProfile preferences").lean(),
      SearchEvent.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("query createdAt")
        .lean()
    ]);

    if (!user) {
      return { isGuest: true, note: "User account not found" };
    }

    const hp = user.healthProfile || {};
    const pref = user.preferences || {};

    return {
      isGuest: false,
      userName: user.name,
      region: user.region || hp.region || "Global",
      dietaryStyle: hp.diet || pref.dietaryStyle || "Standard",
      allergies: hp.allergies && hp.allergies.length ? hp.allergies : [],
      healthConditions: hp.healthConditions && hp.healthConditions.length ? hp.healthConditions : [],
      fitnessGoals: hp.fitnessGoals && hp.fitnessGoals.length ? hp.fitnessGoals : [],
      favoriteFruits: pref.favoriteFruits && pref.favoriteFruits.length ? pref.favoriteFruits : [],
      recentSearches: recentSearches.map((s) => s.query).filter(Boolean)
    };
  } catch (error) {
    console.warn("[RAG Service] Error retrieving user context:", error.message);
    return { isGuest: true, error: error.message };
  }
}

/**
 * Find fruits mentioned in the query, user's favorites, or health conditions
 */
export async function getRelevantFruitKnowledge(userMessage = "", favoriteFruits = []) {
  let allFruits = fruits;
  if (isMongoReady()) {
    const stored = await Fruit.find().lean();
    if (stored && stored.length > 0) allFruits = stored;
  }
  const lowerMsg = userMessage.toLowerCase();

  const matchedSlugs = new Set();
  const matched = [];

  // 1. Direct name or slug match in user's query or favorites
  for (const f of allFruits) {
    const nameMatch = f.name && lowerMsg.includes(f.name.toLowerCase());
    const slugMatch = f.slug && lowerMsg.includes(f.slug.toLowerCase());
    const favMatch = favoriteFruits.some(
      (fav) => typeof fav === "string" && fav.toLowerCase() === f.name.toLowerCase()
    );

    if (nameMatch || slugMatch || favMatch) {
      matched.push(f);
      matchedSlugs.add(f.slug);
    }
  }

  // 2. Health condition keyword mapping (e.g. diabetic, immunity, pressure, etc.)
  const healthConditionKeywords = [
    { keys: ["diabet", "sugar", "glucose", "insulin"], slugs: ["jamun", "guava", "amla", "apple", "kiwi"] },
    { keys: ["immunit", "cold", "flu", "vitamin c"], slugs: ["amla", "orange", "guava", "kiwi"] },
    { keys: ["pressure", "hypertens", "bp"], slugs: ["pomegranate", "watermelon", "banana"] },
    { keys: ["heart", "cardio", "cholesterol"], slugs: ["pomegranate", "apple", "blueberry", "avocado"] },
    { keys: ["workout", "gym", "muscle", "protein", "recovery"], slugs: ["banana", "avocado", "fig"] }
  ];

  for (const rule of healthConditionKeywords) {
    if (rule.keys.some((k) => lowerMsg.includes(k))) {
      for (const slug of rule.slugs) {
        if (!matchedSlugs.has(slug)) {
          const fruitObj = allFruits.find((f) => f.slug === slug);
          if (fruitObj) {
            matched.push(fruitObj);
            matchedSlugs.add(slug);
          }
        }
      }
    }
  }

  // Cap at 4 fruits to prevent prompt bloating
  const selectedFruits = matched.slice(0, 4);

  // If no specific fruits or conditions matched, extract 2 seasonal/popular fruits as reference
  const fruitsToSummarize =
    selectedFruits.length > 0
      ? selectedFruits
      : allFruits.slice(0, 2);

  const fruitSummaries = fruitsToSummarize.map((f) => ({
    name: f.name,
    slug: f.slug,
    calories: f.nutrition?.calories,
    fiberG: f.nutrition?.fiber,
    sugarG: f.nutrition?.sugar,
    glycemicIndex: f.glycemicIndex ? `${f.glycemicIndex.value ?? f.glycemicIndex} (${f.glycemicIndex.category || "GI"})` : "Medium",
    vitamins: (f.vitamins || []).join(", "),
    topBenefits: (f.benefits || []).slice(0, 2),
    cautions: (f.allergies || []).concat(f.avoidFor || []).slice(0, 2),
    bestTiming: f.timing || "Morning or post-workout",
    season: f.seasonality?.India || f.seasonality?.global || "Seasonal"
  }));

  // Find relevant recipe pairings
  const mentionedSlugs = fruitsToSummarize.map((f) => f.slug);
  const relevantRecipes = recipes
    .filter((r) => r.fruitSlugs?.some((s) => mentionedSlugs.includes(s)))
    .slice(0, 3)
    .map((r) => ({
      title: r.title,
      category: r.category,
      method: r.method?.slice(0, 120)
    }));

  return {
    fruits: fruitSummaries,
    recipes: relevantRecipes
  };
}

/**
 * Full RAG context retrieval entrypoint
 */
export async function assembleRAGContext(userId, userMessage) {
  const userCtx = await getUserContext(userId);
  const fruitCtx = await getRelevantFruitKnowledge(
    userMessage,
    userCtx.favoriteFruits || []
  );

  return {
    user: userCtx,
    catalog: fruitCtx
  };
}
