import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true },
    title: String,
    image: String,
    fruitSlugs: [String],
    category: String,
    ingredients: [String],
    method: String,
    note: String,
    diet: [String],
    region: [String],
    avoidAllergies: [String],
    ageRange: String,
    calories: Number,
    macros: Object,
    steps: [String],
    benefits: [String]
  },
  { timestamps: true }
);

export const Recipe = mongoose.model("Recipe", recipeSchema);
