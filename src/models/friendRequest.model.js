import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema(
  {
    requestSender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestReceiver: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected","canceled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const FriendRequest = mongoose.model("FriendRequest",friendRequestSchema)