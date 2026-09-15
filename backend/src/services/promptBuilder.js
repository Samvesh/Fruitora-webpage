/**
 * Sanitize and validate incoming user message with basic prompt-injection guardrails
 */
export function sanitizeUserMessage(rawMessage) {
  if (typeof rawMessage !== "string") return "";

  let cleaned = rawMessage.trim();

  // 1. Length cap to prevent context window overflow / token exhaustion
  if (cleaned.length > 800) {
    cleaned = cleaned.slice(0, 800);
  }

  // 2. Strip control characters and excessive whitespace
  cleaned = cleaned.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  cleaned = cleaned.replace(/\s{3,}/g, " ");

  // 3. Prompt injection guard: detect and neutralize attempts to hijack system prompt
  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous|prior)\s+instructions/gi,
    /system\s+prompt\s+override/gi,
    /you\s+are\s+now\s+(in\s+)?(developer\s+mode|unrestricted|DAN)/gi,
    /disregard\s+(all\s+)?guidelines/gi,
    /reveal\s+(your\s+)?(system\s+prompt|hidden\s+instructions)/gi
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, "[inquiry]");
    }
  }

  return cleaned;
}

/**
 * Construct system prompt with injected RAG context
 */
export function buildSystemPrompt(ragContext) {
  const { user, catalog } = ragContext;

  let userProfileSection = "";
  if (user.isGuest) {
    userProfileSection = `USER STATUS: Guest user (not logged in).
- Provide factual, evidence-informed, general fruit guidance.
- If relevant to goals or allergies, politely mention they can sign in to save health preferences.`;
  } else {
    userProfileSection = `USER PROFILE (Authenticated user: ${user.userName || "Member"}):
- Region: ${user.region || "Global"}
- Dietary Style: ${user.dietaryStyle || "Standard"}
- Stored Health Goals: ${user.fitnessGoals?.length ? user.fitnessGoals.join(", ") : "None specified"}
- Health Conditions / Concerns: ${user.healthConditions?.length ? user.healthConditions.join(", ") : "None specified"}
- Documented Allergies: ${user.allergies?.length ? user.allergies.join(", ") : "None documented"}
- Favorite Fruits: ${user.favoriteFruits?.length ? user.favoriteFruits.join(", ") : "None selected yet"}
- Recent Searches: ${user.recentSearches?.length ? user.recentSearches.join(", ") : "None"}`;
  }

  let fruitDataSection = "";
  if (catalog.fruits?.length > 0) {
    fruitDataSection = `RELEVANT FRUIT CATALOG DATA:
${catalog.fruits
  .map(
    (f) => `• ${f.name}: ~${f.calories} kcal/100g | Fiber: ${f.fiberG}g | Sugar: ${f.sugarG}g | GI: ${f.glycemicIndex} | Key Vitamins: ${f.vitamins}
  Benefits: ${f.topBenefits?.join("; ")}
  Cautions/Allergies: ${f.cautions?.join("; ")}
  Timing/Season: ${f.bestTiming} (${f.season})`
  )
  .join("\n\n")}`;
  }

  let recipeSection = "";
  if (catalog.recipes?.length > 0) {
    recipeSection = `POPULAR FRUIT PAIRINGS & RECIPES:
${catalog.recipes.map((r) => `• ${r.title} (${r.category}): ${r.method}`).join("\n")}`;
  }

  return `You are Fruitora's AI Health & Nutrition Assistant — an evidence-informed, encouraging, and culinary-smart fruit intelligence guide.

${userProfileSection}

${fruitDataSection}

${recipeSection}

INSTRUCTIONS FOR YOUR RESPONSE:
1. Ground your answers in practical nutritional science (vitamins, dietary fiber, glycemic index, hydration, antioxidant flavonoids).
2. If the user has documented health conditions (e.g. diabetes, hypertension) or allergies, ALWAYS consider them first. Respect safety warnings.
3. Suggest creative fruit pairings, timing (e.g. pre-workout, morning, post-meal), and easy culinary preparations when appropriate.
4. Keep answers engaging, structured, and easy to read using clean markdown (bullet points, bold key highlights).
5. Maintain a supportive, cinematic, and warm tone. Keep answers concise (2 to 4 crisp paragraphs/sections max) to respect reader focus.
6. Standard medical reminder: Remind users that fruit guidance supports healthy living, but clinical dietary restrictions should be confirmed with their healthcare provider.`;
}
