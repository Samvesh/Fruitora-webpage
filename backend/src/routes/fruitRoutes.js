import express from "express";
import { getFruit, history, listFruits, mapData, trendingFruits } from "../controllers/fruitController.js";

export const fruitRoutes = express.Router();

fruitRoutes.get("/", listFruits);
fruitRoutes.get("/trending", trendingFruits);
fruitRoutes.get("/history", history);
fruitRoutes.get("/maps/production", mapData);
fruitRoutes.get("/:slug", getFruit);
