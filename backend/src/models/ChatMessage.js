import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      sparse: true
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    contextSummary: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// In-memory fallback message storage when MongoDB is not connected
export const inMemoryChatStore = new Map(); // userId or 'guest' -> Array<message>

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
