import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { fruits, recipes } from "./fruitData.js";
import { Fruit } from "../models/Fruit.js";
import { Recipe } from "../models/Recipe.js";
import { User } from "../models/User.js";

// Guard: seed script requires a real MongoDB connection
if (!process.env.MONGODB_URI) {
  console.error("[seed] ERROR: MONGODB_URI environment variable is not set.");
  console.error("[seed] Set MONGODB_URI in your .env file or environment before running this script.");
  process.exit(1);
}

const requiredSeedEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    console.error(`[seed] ERROR: ${name} environment variable is not set.`);
    process.exit(1);
  }
  return value;
};

const adminEmail = requiredSeedEnv("SEED_ADMIN_EMAIL").toLowerCase();
const adminPassword = requiredSeedEnv("SEED_ADMIN_PASSWORD");

const run = async () => {
  const connected = await connectDB();
  if (!connected) {
    console.error("[seed] ERROR: Could not connect to MongoDB. Aborting seed.");
    process.exit(1);
  }

  // --- Fruit & Recipe data: always overwrite (these are static reference data) ---
  await Fruit.deleteMany({});
  await Recipe.deleteMany({});
  await Fruit.insertMany(fruits);
  await Recipe.insertMany(recipes);
  console.log(`[seed] Inserted ${fruits.length} fruits and ${recipes.length} recipes.`);

  // --- Admin user: upsert so re-running never creates a duplicate ---
  const existing = await User.findOne({ email: adminEmail });

  if (existing) {
    console.log(`[seed] Admin user already exists (${adminEmail}). Skipping creation.`);
  } else {
    // Creating via User.create triggers the pre-save hook that bcrypt-hashes the password
    await User.create({
      name: "Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      region: "Global"
    });
    console.log(`[seed] Admin user created: ${adminEmail}`);
  }

  console.log("[seed] Done.");
};

run()
  .catch((err) => {
    console.error("[seed] Unexpected error:", err.message);
    process.exit(1);
  })
  .finally(() => mongoose.connection.close());
