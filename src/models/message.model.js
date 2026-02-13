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
    text: { 
        type: String,
        required: true,
    },
   status: {
        type: String,
        enum: ["sent", "delivered", "read"],
        default: "sent",
    },
    ts: {
        type: Date,
        default: Date.now,
    },
},{timestamps: true});

export const Message = mongoose.model("Message",messageSchema)