import jwt from "jsonwebtoken";

export const signToken = (user) =>
  jwt.sign(
    { id: user._id?.toString?.() || user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "development-secret-change-me",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
