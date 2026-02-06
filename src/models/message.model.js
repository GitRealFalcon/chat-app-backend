import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    content: {
        type: String,
        required: true,
    },
   status: {
        type: String,
        enum: ["sent", "delivered", "read"],
        default: "sent",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
},{timestamps: true});

export const Message = mongoose.model("Message",messageSchema)