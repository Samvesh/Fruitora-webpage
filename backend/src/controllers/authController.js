import bcrypt from "bcryptjs";
import { isMongoReady } from "../config/db.js";
import { User } from "../models/User.js";
import { signToken } from "../utils/tokens.js";

const memoryUsers = [];

const publicUser = (user) => ({
  id: user._id?.toString?.() || user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  region: user.region,
  healthProfile: user.healthProfile,
  preferences: user.preferences
});

export const register = async (req, res) => {
  const { name, email, password, region } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Name, email, and password are required" });
  if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

  if (isMongoReady()) {
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already registered" });
    const user = await User.create({ name, email, password, region });
    return res.status(201).json({ user: publicUser(user), token: signToken(user) });
  }

  const exists = memoryUsers.find((user) => user.email === email.toLowerCase());
  if (exists) return res.status(409).json({ message: "Email already registered" });
  const user = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    password: await bcrypt.hash(password, 12),
    role: email.toLowerCase().includes("admin") ? "admin" : "user",
    region: region || "Global"
  };
  memoryUsers.push(user);
  return res.status(201).json({ user: publicUser(user), token: signToken(user) });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  if (isMongoReady()) {
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: "Invalid credentials" });
    return res.json({ user: publicUser(user), token: signToken(user) });
  }

  const user = memoryUsers.find((candidate) => candidate.email === email.toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid credentials" });
  return res.json({ user: publicUser(user), token: signToken(user) });
};

export const me = async (req, res) => {
  return res.json({ user: publicUser(req.user) });
};

export const updateHealthProfile = async (req, res) => {
  if (isMongoReady()) {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { healthProfile: req.body },
      { new: true, runValidators: true }
    );
    return res.json({ user: publicUser(user) });
  }

  const user = memoryUsers.find((candidate) => candidate.id === req.user.id);
  if (user) user.healthProfile = req.body;
  return res.json({ user: publicUser(user || req.user) });
};
