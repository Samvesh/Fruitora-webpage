import bcrypt from "bcryptjs";
import { isMongoReady } from "../config/db.js";
import { SearchEvent } from "../models/SearchEvent.js";
import { User } from "../models/User.js";
import { getRecentMemorySearches } from "../services/analyticsStore.js";
import { signToken } from "../utils/tokens.js";

const requiredDemoEnv = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set to start the API demo account.`);
  return value;
};

const demoEmail = requiredDemoEnv("DEMO_USER_EMAIL").toLowerCase();
const demoPassword = requiredDemoEnv("DEMO_USER_PASSWORD");
const DEMO_PASSWORD_HASH = bcrypt.hashSync(demoPassword, 10);

const memoryUsers = [
  {
    id: "demo-user-1",
    name: "Alex Morgan",
    email: demoEmail,
    password: DEMO_PASSWORD_HASH,
    role: "user",
    region: "Asia / India",
    healthProfile: {
      age: 29,
      weightKg: 68,
      heightCm: 175,
      region: "Asia / India",
      healthConditions: ["Borderline Diabetic", "Mild Hypertension"],
      allergies: ["Latex-fruit allergy"],
      fitnessGoals: ["Blood Sugar Balance", "Immunity", "Active Recovery"],
      diet: "Vegetarian"
    },
    preferences: {
      favoriteFruits: ["Kiwi", "Jamun", "Amla", "Apple", "Guava"],
      dietaryStyle: "Low-Glycemic Whole Foods"
    }
  }
];

const publicUser = (user) => ({
  id: user._id?.toString?.() || user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  region: user.region || user.healthProfile?.region || "Global",
  healthProfile: user.healthProfile || {},
  preferences: user.preferences || {}
});

export const register = async (req, res) => {
  const {
    name,
    email,
    password,
    region,
    age,
    weightKg,
    heightCm,
    healthConditions,
    allergies,
    fitnessGoals,
    diet
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  const initialHealthProfile = {
    age: Number(age) || 28,
    weightKg: Number(weightKg) || null,
    heightCm: Number(heightCm) || null,
    region: region || "Global",
    healthConditions: Array.isArray(healthConditions)
      ? healthConditions
      : typeof healthConditions === "string"
      ? healthConditions.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    allergies: Array.isArray(allergies)
      ? allergies
      : typeof allergies === "string"
      ? allergies.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    fitnessGoals: Array.isArray(fitnessGoals)
      ? fitnessGoals
      : typeof fitnessGoals === "string"
      ? fitnessGoals.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
    diet: diet || "Balanced"
  };

  if (isMongoReady()) {
    try {
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ message: "Email already registered" });
      const user = await User.create({
        name,
        email,
        password,
        region: region || "Global",
        healthProfile: initialHealthProfile
      });
      return res.status(201).json({ user: publicUser(user), token: signToken(user) });
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ message: "Email already registered" });
      if (err.name === "ValidationError") {
        const msg = Object.values(err.errors).map((e) => e.message).join(", ");
        return res.status(400).json({ message: msg });
      }
      throw err;
    }
  }

  const exists = memoryUsers.find((user) => user.email === email.toLowerCase());
  if (exists) return res.status(409).json({ message: "Email already registered" });

  const user = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    password: await bcrypt.hash(password, 12),
    role: email.toLowerCase().includes("admin") ? "admin" : "user",
    region: region || "Global",
    healthProfile: initialHealthProfile,
    preferences: {
      favoriteFruits: [],
      dietaryStyle: "Balanced"
    }
  };
  memoryUsers.push(user);
  return res.status(201).json({ user: publicUser(user), token: signToken(user) });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  if (isMongoReady()) {
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    return res.json({ user: publicUser(user), token: signToken(user) });
  }

  const user = memoryUsers.find((candidate) => candidate.email === email.toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  return res.json({ user: publicUser(user), token: signToken(user) });
};

export const me = async (req, res) => {
  return res.json({ user: publicUser(req.user) });
};

export const getProfile = async (req, res) => {
  const userId = req.user._id || req.user.id;
  let user = req.user;
  let recentSearches = [];

  if (isMongoReady()) {
    user = await User.findById(userId).lean();
    const searches = await SearchEvent.find({ userId })
      .sort({ createdAt: -1 })
      .limit(8)
      .select("query createdAt")
      .lean();
    recentSearches = searches.map((s) => s.query).filter(Boolean);
  } else {
    const memUser = memoryUsers.find((u) => u.id === userId);
    if (memUser) user = memUser;
    recentSearches = getRecentMemorySearches(8);
  }

  return res.json({
    user: publicUser(user),
    recentSearches
  });
};

export const updateHealthProfile = async (req, res) => {
  const payload = req.body;

  if (isMongoReady()) {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { healthProfile: payload },
      { new: true, runValidators: true }
    );
    return res.json({ user: publicUser(user) });
  }

  const user = memoryUsers.find((candidate) => candidate.id === req.user.id);
  if (user) {
    user.healthProfile = { ...user.healthProfile, ...payload };
    return res.json({ user: publicUser(user) });
  }

  return res.json({ user: publicUser(req.user) });
};

export const updateProfile = async (req, res) => {
  const { name, region, healthProfile, preferences } = req.body;
  const updateData = {};
  if (name) updateData.name = name;
  if (region) updateData.region = region;
  if (healthProfile) updateData.healthProfile = healthProfile;
  if (preferences) updateData.preferences = preferences;

  if (isMongoReady()) {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    return res.json({ user: publicUser(user) });
  }

  const user = memoryUsers.find((candidate) => candidate.id === req.user.id);
  if (user) {
    if (name) user.name = name;
    if (region) user.region = region;
    if (healthProfile) user.healthProfile = { ...user.healthProfile, ...healthProfile };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    return res.json({ user: publicUser(user) });
  }

  return res.json({ user: publicUser(req.user) });
};
