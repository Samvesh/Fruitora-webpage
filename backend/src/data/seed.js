import "dotenv/config";
import { connectDB } from "../config/db.js";
import { fruits, recipes } from "./fruitData.js";
import { Fruit } from "../models/Fruit.js";
import { Recipe } from "../models/Recipe.js";
import { User } from "../models/User.js";

await connectDB();
await Fruit.deleteMany({});
await Recipe.deleteMany({});
await User.deleteMany({});
await Fruit.insertMany(fruits);
await Recipe.insertMany(recipes);
await User.create({
  name: "Admin",
  email: "admin@fruitora.app",
  password: "AdminPass123",
  role: "admin",
  region: "Global"
});

console.log("Seeded fruit data, recipes, and admin user.");
process.exit(0);
