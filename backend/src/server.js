import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env, validateEnv } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { analyticsRoutes } from "./routes/analyticsRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { fruitRoutes } from "./routes/fruitRoutes.js";
import { recommendationRoutes } from "./routes/recommendationRoutes.js";

const app = express();
const port = env.port;
const allowedOrigins = env.clientUrl.split(",").map((origin) => origin.trim()).filter(Boolean);

validateEnv();
await connectDB();

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "fruit-nutrition-platform", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/fruits", fruitRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || "Server error" });
});

app.listen(port, () => console.log(`Fruit nutrition API running on http://localhost:${port}`));
