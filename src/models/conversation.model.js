import mongoose from "mongoose";
import crypto from "crypto";

const lastMessageSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    text: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "video", "document", "audio", "file", "system"],
      default: "text",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct"],
      default: "direct",
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    participantHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    lastMessage: {
      type: lastMessageSchema,
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    unreadCountByUser: {
      type: Map,
      of: Number,
      default: {},
    },
    mutedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    archivedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

conversationSchema.index({ participants: 1, lastMessageAt: -1 });
conversationSchema.index({ lastMessageAt: -1 });

conversationSchema.pre("validate", function (next) {
  if (!Array.isArray(this.participants) || this.participants.length !== 2) {
    return next(new Error("Direct conversation must have exactly 2 participants"));
  }

  const normalizedIds = this.participants
    .map((id) => String(id))
    .sort((a, b) => a.localeCompare(b));

  if (normalizedIds[0] === normalizedIds[1]) {
    return next(new Error("Conversation participants must be distinct users"));
  }

  this.participants = normalizedIds.map((id) => new mongoose.Types.ObjectId(id));
  this.participantHash = crypto
    .createHash("sha256")
    .update(normalizedIds.join(":"))
    .digest("hex");

  next();
});

export const Conversation = mongoose.model("Conversation", conversationSchema);
