import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("MONGODB_URI is not set. API will use in-memory seed data.");
    return false;
  }

  if (process.env.NODE_ENV === "production" && /localhost|127\.0\.0\.1/.test(uri)) {
    console.warn("Local MongoDB URI ignored in production. API will use in-memory seed data.");
    return false;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.warn("MongoDB unavailable. API will use in-memory seed data.");
    console.warn(error.message);
    return false;
  }
};

export const isMongoReady = () => mongoose.connection.readyState === 1;
