import mongoose from "mongoose";

const productionSchema = new mongoose.Schema(
  {
    country: String,
    tons: Number,
    lat: Number,
    lng: Number
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    year: String,
    event: String
  },
  { _id: false }
);

const fruitSchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, index: true },
    name: String,
    scientificName: String,
    category: [String],
    image: String,
    color: String,
    originRegions: [String],
    productionRegions: [String],
    exportRegions: [String],
    importRegions: [String],
    climateZones: [String],
    seasonality: Object,
    glycemicIndex: Object,
    vitamins: [String],
    minerals: [String],
    nutrition: Object,
    benefits: [String],
    science: [String],
    sideEffects: [String],
    allergies: [String],
    drugInteractions: [String],
    avoidFor: [String],
    timing: String,
    storage: [String],
    ripeningStages: [String],
    intake: String,
    scientificFacts: [String],
    origin: String,
    ancientUses: [String],
    culture: String,
    history: [timelineSchema],
    timeline: [timelineSchema],
    production: [productionSchema],
    climate: [String],
    varieties: [Object]
  },
  { timestamps: true }
);

export const Fruit = mongoose.model("Fruit", fruitSchema);
