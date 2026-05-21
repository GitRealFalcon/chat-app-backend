import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: { 
        type: String,
        required: true,
        trim: true,
    },
    type:{
        type: String,
        enum: ["text" , "image" , "video" , "document", "audio", "file"],
        default: "text",
    },
    fileUrl:{
        type: String
    },
    fileName:{
        type: String
    },
    fileSize:{
        type: String
    },
    mimeType:{
        type: String
    },
    thumbnail:{
        type: String
    },
   status: {
        type: String,
        enum: ["sending","sent", "delivered", "read", "failed"],
        default: "sent",
    },
    msgId:{
        type: String,
        index: true,
    },
    clientMsgId: {
        type: String,
        index: true,
    },
    ts: {
        type: Date,
        default: Date.now,
    },
    sentAt: {
        type: Date,
        default: Date.now,
    },
    deliveredAt: {
        type: Date,
    },
    readAt: {
        type: Date,
    },
},{timestamps: true});

messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, status: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, createdAt: -1, _id: -1 });
messageSchema.index({ sender: 1, msgId: 1 }, { unique: true, sparse: true });
messageSchema.index({ sender: 1, clientMsgId: 1 }, { unique: true, sparse: true });

messageSchema.pre("validate", function (next) {
    if (!this.clientMsgId && this.msgId) {
        this.clientMsgId = this.msgId;
    }

    if (!this.sentAt) {
        this.sentAt = this.ts || new Date();
    }

    next();
});

export const Message = mongoose.model("Message",messageSchema)