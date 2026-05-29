import mongoose from "mongoose";

const searchEventSchema = new mongoose.Schema(
  {
    query: { type: String, required: true, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    region: String,
    resultCount: Number
  },
  { timestamps: true }
);

export const SearchEvent = mongoose.model("SearchEvent", searchEventSchema);
