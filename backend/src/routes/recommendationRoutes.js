import express from "express";
import { healthRecommendations, recipeRecommendations } from "../controllers/recommendationController.js";

export const recommendationRoutes = express.Router();

recommendationRoutes.get("/recipes", recipeRecommendations);
recommendationRoutes.post("/health", healthRecommendations);
