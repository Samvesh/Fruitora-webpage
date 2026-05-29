import express from "express";
import { analyticsOverview } from "../controllers/analyticsController.js";
import { adminOnly, protect } from "../middleware/auth.js";

export const analyticsRoutes = express.Router();

analyticsRoutes.get("/overview", analyticsOverview);
analyticsRoutes.get("/admin", protect, adminOnly, analyticsOverview);
