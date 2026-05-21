import mongoose from "mongoose";

const messageStatusSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    state: {
      type: String,
      enum: ["sent", "delivered", "read"],
      required: true,
    },
    stateAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: true },
);

messageStatusSchema.index({ messageId: 1, userId: 1 }, { unique: true });
messageStatusSchema.index({ userId: 1, state: 1, stateAt: -1 });

export const MessageStatus = mongoose.model("MessageStatus", messageStatusSchema);
