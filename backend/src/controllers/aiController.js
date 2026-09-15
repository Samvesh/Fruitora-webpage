import { isMongoReady } from "../config/db.js";
import { fruits } from "../data/fruitData.js";
import { ChatMessage, inMemoryChatStore } from "../models/ChatMessage.js";
import { Fruit } from "../models/Fruit.js";
import { SearchEvent } from "../models/SearchEvent.js";
import { recordMemorySearch } from "../services/analyticsStore.js";
import { streamGroqChat } from "../services/groqService.js";
import { buildSystemPrompt, sanitizeUserMessage } from "../services/promptBuilder.js";
import { assembleRAGContext } from "../services/ragService.js";

/**
 * Handle streaming AI chat responses via Server-Sent Events (SSE)
 * POST /api/ai/chat
 */
export async function chatStream(req, res) {
  const rawMessage = req.body?.message;
  if (!rawMessage || typeof rawMessage !== "string" || !rawMessage.trim()) {
    return res.status(400).json({ message: "A message string is required." });
  }

  const userId = req.user?._id || req.user?.id || null;
  const sanitizedMessage = sanitizeUserMessage(rawMessage);

  if (!sanitizedMessage) {
    return res.status(400).json({ message: "Invalid or empty message content." });
  }

  try {
    // 1. Retrieve RAG Context (User Profile + Fruit DB Facts + Recipes)
    const ragContext = await assembleRAGContext(userId, sanitizedMessage);
    const systemPrompt = buildSystemPrompt(ragContext);

    // 2. Prepare message window (System + recent client history + current user message)
    const clientHistory = Array.isArray(req.body.history) ? req.body.history.slice(-6) : [];
    const formattedHistory = clientHistory
      .filter((h) => h && (h.role === "user" || h.role === "assistant") && typeof h.content === "string")
      .map((h) => ({
        role: h.role,
        content: sanitizeUserMessage(h.content).slice(0, 400)
      }));

    const messages = [
      { role: "system", content: systemPrompt },
      ...formattedHistory,
      { role: "user", content: sanitizedMessage }
    ];

    // 3. Set SSE Streaming Headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    });
    res.socket?.setNoDelay?.(true);
    if (typeof res.flushHeaders === "function") res.flushHeaders();

    // Send metadata packet (RAG summary and profile mode)
    const metaPayload = {
      type: "meta",
      isGuest: ragContext.user.isGuest,
      userName: ragContext.user.userName || null,
      referencedFruits: (ragContext.catalog.fruits || []).map((f) => f.name)
    };
    res.write(`data: ${JSON.stringify(metaPayload)}\n\n`);
    if (typeof res.flush === "function") res.flush();

    // 4. Stream response tokens from Groq
    let fullReply = "";
    for await (const token of streamGroqChat(messages)) {
      fullReply += token;
      res.write(`data: ${JSON.stringify({ type: "token", text: token })}\n\n`);
      if (typeof res.flush === "function") res.flush();
    }

    // 5. Send completion event
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    if (typeof res.flush === "function") res.flush();
    res.end();

    // 6. Asynchronously save messages to database
    if (userId) {
      persistMessages(userId, sanitizedMessage, fullReply).catch((err) =>
        console.warn("[AI Controller] Failed to persist chat message:", err.message)
      );
    }
  } catch (error) {
    console.error("[AI Controller Error]", error.message);

    // If headers haven't been sent yet, send standard JSON error
    if (!res.headersSent) {
      return res.status(500).json({ message: error.message || "Failed to process AI chat request" });
    }

    // If streaming has already begun, send SSE error event and close
    res.write(`data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`);
    res.end();
  }
}

/**
 * Instant Search More with AI (Search Bar format, not chatbot)
 * POST /api/ai/fruit-search
 */
export async function searchFruitAI(req, res) {
  const { fruitName } = req.body;
  if (!fruitName || typeof fruitName !== "string" || !fruitName.trim()) {
    return res.status(400).json({ message: "Fruit name is required." });
  }

  const query = fruitName.trim();
  const userId = req.user?._id || req.user?.id || null;

  // Track search event in background
  if (isMongoReady()) {
    SearchEvent.create({
      query,
      userId,
      region: req.user?.region || "Global",
      resultCount: 1
    }).catch(() => {});
  } else {
    recordMemorySearch({ query, userId, region: req.user?.region || "Global", resultCount: 1 });
  }

  // 1. Check local catalog first
  try {
    const allFruits = isMongoReady() ? await Fruit.find().lean() : fruits;
    const match = allFruits.find(
      (f) =>
        f.name.toLowerCase() === query.toLowerCase() ||
        f.slug?.toLowerCase() === query.toLowerCase() ||
        (f.aliases || []).some((a) => a.toLowerCase() === query.toLowerCase())
    );

    if (match) {
      return res.json({
        fruit: {
          name: match.name,
          scientificName: match.scientificName || "Botanical species",
          origin: (match.originRegions || ["Global"]).join(", "),
          description: match.description || `${match.name} is a nutrient-dense fruit known for its exceptional health profile.`,
          calories: match.nutrition?.calories || 55,
          fiber: match.nutrition?.fiber || 2.5,
          sugar: match.nutrition?.sugar || 10.2,
          glycemicIndex: match.glycemicIndex ? `${match.glycemicIndex.value ?? match.glycemicIndex} (${match.glycemicIndex.category || "Low"})` : "Low (< 55)",
          vitamins: match.vitamins || ["Vitamin C", "Potassium", "Dietary Fiber"],
          benefits: match.benefits || ["Supports cardiovascular vitality", "High antioxidant density", "Aids healthy metabolic balance"],
          timing: match.timing || "Best consumed during breakfast or active morning hours",
          culinaryTips: (match.culinaryPairings || ["Pairs wonderfully with yogurt, leafy greens, or nut butter"]).join(", "),
          cautions: (match.allergies || []).concat(match.avoidFor || ["Consume in moderate whole portions"]).join(", "),
          source: "Fruitora Verified Botanical Database"
        }
      });
    }
  } catch (err) {
    console.warn("[Local Match Error]", err.message);
  }

  // 2. Query Groq AI for instant verified dossier
  try {
    const prompt = `You are a professional botanical and clinical nutritionist. Provide factual, concise nutritional intelligence for the fruit: "${query}".
Return STRICT JSON ONLY with this exact JSON structure:
{
  "name": "${query.charAt(0).toUpperCase() + query.slice(1)}",
  "scientificName": "Scientific binomial name",
  "origin": "Native geographic origin and top growing regions",
  "description": "2 sentence clear botanical and flavor summary",
  "calories": 50,
  "fiber": 2.5,
  "sugar": 9.5,
  "glycemicIndex": "Low (45)",
  "vitamins": ["Vitamin C", "Potassium", "Antioxidants"],
  "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
  "timing": "Optimal time of day to eat",
  "culinaryTips": "Pairing ideas and culinary preparation",
  "cautions": "Any known allergy or cautions"
}`;

    let fullText = "";
    for await (const token of streamGroqChat([{ role: "user", content: prompt }], { maxTokens: 450, temperature: 0.3 })) {
      fullText += token;
    }

    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      parsed.source = "Groq AI Botanical Intelligence";
      return res.json({ fruit: parsed });
    }
  } catch (err) {
    console.warn("[Fruit AI Search Error]:", err.message);
  }

  // Fallback if AI output was irregular
  return res.json({
    fruit: {
      name: query.charAt(0).toUpperCase() + query.slice(1),
      scientificName: "Exotic Botanical Specimen",
      origin: "Tropical & Temperate Agro-regions",
      description: `${query} is known for its valuable micronutrient spectrum, culinary versatility, and dietary benefits.`,
      calories: 58,
      fiber: 2.8,
      sugar: 9.4,
      glycemicIndex: "Moderate (45-55)",
      vitamins: ["Vitamin C", "Antioxidants", "Electrolytes"],
      benefits: [
        "Provides bioavailable hydration and micronutrients",
        "Supports cellular recovery and healthy gut digestion",
        "Natural dietary fiber aids glycemic moderation"
      ],
      timing: "Morning or mid-day replenishment",
      culinaryTips: "Enjoy fresh as whole fruit or slice into nutrient-rich breakfast bowls.",
      cautions: "Moderate intake if monitoring strict carbohydrate limits.",
      source: "Fruitora Botanical Engine"
    }
  });
}

/**
 * Fetch chat message history for authenticated user
 * GET /api/ai/history
 */
export async function getHistory(req, res) {
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    return res.json({ messages: [] });
  }

  try {
    if (isMongoReady()) {
      const messages = await ChatMessage.find({ userId })
        .sort({ createdAt: 1 })
        .limit(40)
        .select("role content createdAt")
        .lean();
      return res.json({ messages });
    }

    const memoryMessages = inMemoryChatStore.get(String(userId)) || [];
    return res.json({ messages: memoryMessages });
  } catch (error) {
    console.warn("[AI Controller] Error fetching history:", error.message);
    return res.status(500).json({ message: "Could not retrieve chat history." });
  }
}

/**
 * Clear chat history for user
 * DELETE /api/ai/history
 */
export async function clearHistory(req, res) {
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    return res.json({ success: true, message: "Guest history cleared" });
  }

  try {
    if (isMongoReady()) {
      await ChatMessage.deleteMany({ userId });
    }
    inMemoryChatStore.delete(String(userId));
    return res.json({ success: true, message: "Chat history cleared successfully" });
  } catch (error) {
    console.warn("[AI Controller] Error clearing history:", error.message);
    return res.status(500).json({ message: "Failed to clear chat history" });
  }
}

/**
 * Internal helper to save user & assistant interaction
 */
async function persistMessages(userId, userText, assistantReply) {
  if (!userId || !assistantReply) return;

  if (isMongoReady()) {
    await ChatMessage.create([
      { userId, role: "user", content: userText },
      { userId, role: "assistant", content: assistantReply }
    ]);
  } else {
    const key = String(userId);
    const existing = inMemoryChatStore.get(key) || [];
    existing.push(
      { role: "user", content: userText, createdAt: new Date() },
      { role: "assistant", content: assistantReply, createdAt: new Date() }
    );
    inMemoryChatStore.set(key, existing.slice(-40));
  }
}
