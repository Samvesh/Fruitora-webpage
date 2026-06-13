import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("[DB] MONGODB_URI is not set. API will use in-memory seed data.");
    return false;
  }

  if (process.env.NODE_ENV === "production" && /localhost|127\.0\.0\.1/.test(uri)) {
    console.warn("[DB] Local MongoDB URI detected in production — ignoring. API will use in-memory seed data.");
    return false;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log(`[DB] MongoDB connected successfully (readyState=${mongoose.connection.readyState})`);
    return true;
  } catch (error) {
    // In production, log as ERROR so it's visible in Render logs — don't silently fall back
    const level = process.env.NODE_ENV === "production" ? "ERROR" : "WARN";
    console.error(`[DB] [${level}] MongoDB connection failed — falling back to in-memory data.`);
    console.error(`[DB] Reason: ${error.message}`);
    return false;
  }
};

export const isMongoReady = () => mongoose.connection.readyState === 1;

