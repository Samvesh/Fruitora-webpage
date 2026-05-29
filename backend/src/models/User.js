import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const healthProfileSchema = new mongoose.Schema(
  {
    age: Number,
    region: String,
    allergies: [String],
    healthConditions: [String],
    fitnessGoals: [String],
    diet: String
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    region: { type: String, default: "Global" },
    healthProfile: healthProfileSchema,
    preferences: {
      favoriteFruits: [String],
      dietaryStyle: String
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model("User", userSchema);
