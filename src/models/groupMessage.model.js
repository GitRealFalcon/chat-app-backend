import mongoose from "mongoose";

const groupMessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    text: {
        type: String,
        required: true,
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group", 
    },
    ts: {
        type: Date,
        default: Date.now,
    },
    deliveredTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
},{timestamps: true}); 

export const GroupMessage = mongoose.model("GroupMessage",groupMessageSchema);