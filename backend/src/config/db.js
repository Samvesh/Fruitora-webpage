import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("MONGODB_URI is not set. API will use in-memory seed data.");
    return false;
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.warn("MongoDB unavailable. API will use in-memory seed data.");
    console.warn(error.message);
    return false;
  }
};

export const isMongoReady = () => mongoose.connection.readyState === 1;
