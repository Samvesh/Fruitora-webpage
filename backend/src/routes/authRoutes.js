import express from "express";
import {
  getProfile,
  login,
  me,
  register,
  updateHealthProfile,
  updateProfile
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

export const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.get("/me", protect, me);
authRoutes.get("/profile", protect, getProfile);
authRoutes.put("/profile", protect, updateProfile);
authRoutes.put("/health-profile", protect, updateHealthProfile);
