import express from "express";
import rateLimit from "express-rate-limit";
import {
  chatStream,
  clearHistory,
  getHistory,
  searchFruitAI
} from "../controllers/aiController.js";
import { optionalAuth, protect } from "../middleware/auth.js";

export const aiRoutes = express.Router();

// Cost & abuse guardrail: strict rate limiter on AI streaming route
const aiChatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 25, // limit each IP to 25 AI requests per 10-minute window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "AI request rate limit reached. Please wait a few minutes before asking more questions."
  }
});

// POST /api/ai/chat — Stream RAG response
aiRoutes.post("/chat", aiChatLimiter, optionalAuth, chatStream);

// POST /api/ai/fruit-search — Search More with AI (Search Bar format)
aiRoutes.post("/fruit-search", optionalAuth, searchFruitAI);

// GET /api/ai/history — Fetch conversation messages
aiRoutes.get("/history", optionalAuth, getHistory);

// DELETE /api/ai/history — Clear conversation history
aiRoutes.delete("/history", protect, clearHistory);
