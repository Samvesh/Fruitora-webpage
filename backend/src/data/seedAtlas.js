import "dotenv/config";
import mongoose from "mongoose";
import { fruits, recipes } from "./fruitData.js";
import { Fruit } from "../models/Fruit.js";
import { Recipe } from "../models/Recipe.js";

// Determine MongoDB URI: CLI argument > ATLAS_MONGODB_URI > process.env.MONGODB_URI
const uriArg = process.argv[2];
const targetUri = uriArg || process.env.ATLAS_MONGODB_URI || process.env.MONGODB_URI;

if (!targetUri) {
  console.error("\n[seedAtlas] ERROR: No MongoDB URI provided.");
  console.error("Usage:");
  console.error('  node src/data/seedAtlas.js "mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>"\n');
  console.error("Or set ATLAS_MONGODB_URI in your environment or backend/.env.\n");
  process.exit(1);
}

// Safety check: ensure we are NOT touching local MongoDB
if (targetUri.includes("localhost") || targetUri.includes("127.0.0.1")) {
  console.error("\n[seedAtlas] REFUSED: The provided URI points to a local database (localhost / 127.0.0.1).");
  console.error("This script is strictly intended for production MongoDB Atlas.");
  console.error("URI must be an Atlas cluster URI (e.g. mongodb+srv://...mongodb.net/...).");
  process.exit(1);
}

if (!targetUri.startsWith("mongodb+srv://") && !targetUri.includes("mongodb.net")) {
  console.warn("\n[seedAtlas] WARNING: Target URI does not look like a standard MongoDB Atlas cluster URI.");
}

const run = async () => {
  // Mask credentials for logging
  const maskedUri = targetUri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
  console.log(`[seedAtlas] Connecting to production MongoDB Atlas: ${maskedUri}...`);

  await mongoose.connect(targetUri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000
  });

  console.log("[seedAtlas] Successfully connected to MongoDB Atlas.");

  const initialFruitCount = await Fruit.countDocuments();
  console.log(`[seedAtlas] Existing fruits in database before seeding: ${initialFruitCount}`);

  // Upsert fruits by unique slug to prevent duplicates
  console.log(`[seedAtlas] Upserting ${fruits.length} fruits by slug...`);
  const fruitOps = fruits.map((fruit) => ({
    updateOne: {
      filter: { slug: fruit.slug },
      update: { $set: fruit },
      upsert: true
    }
  }));

  const fruitResult = await Fruit.bulkWrite(fruitOps);
  console.log(
    `[seedAtlas] Fruits bulkWrite result: ${fruitResult.upsertedCount} inserted, ${fruitResult.modifiedCount} updated, ${fruitResult.matchedCount} matched.`
  );

  const finalFruitCount = await Fruit.countDocuments();
  console.log(`[seedAtlas] Total verified fruits in database: ${finalFruitCount}`);

  // Also upsert recipes if present so production has full recipe data
  if (recipes && recipes.length > 0) {
    const initialRecipeCount = await Recipe.countDocuments();
    console.log(`[seedAtlas] Existing recipes in database before seeding: ${initialRecipeCount}`);
    console.log(`[seedAtlas] Upserting ${recipes.length} recipes by id...`);

    const recipeOps = recipes.map((recipe) => ({
      updateOne: {
        filter: { id: recipe.id },
        update: { $set: recipe },
        upsert: true
      }
    }));

    const recipeResult = await Recipe.bulkWrite(recipeOps);
    console.log(
      `[seedAtlas] Recipes bulkWrite result: ${recipeResult.upsertedCount} inserted, ${recipeResult.modifiedCount} updated, ${recipeResult.matchedCount} matched.`
    );

    const finalRecipeCount = await Recipe.countDocuments();
    console.log(`[seedAtlas] Total verified recipes in database: ${finalRecipeCount}`);
  }

  console.log("[seedAtlas] Seeding completed successfully.");
};

run()
  .catch((err) => {
    console.error("[seedAtlas] Error during seeding:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.connection.close();
    console.log("[seedAtlas] Connection closed.");
  });
