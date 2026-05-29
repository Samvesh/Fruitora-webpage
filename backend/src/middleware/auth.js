import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { isMongoReady } from "../config/db.js";

export const protect = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Authentication token required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "development-secret-change-me");
    if (isMongoReady()) {
      req.user = await User.findById(decoded.id).select("-password");
    } else {
      req.user = decoded;
    }
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
  return next();
};
