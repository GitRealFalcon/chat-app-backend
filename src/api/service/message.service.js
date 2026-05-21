import { Message } from "../../models/message.model.js";
import { GroupMessage } from "../../models/groupMessage.model.js";
import { redisClient } from "../../config/redis.js";
import { messageQueue } from "../../queues/message.queue.js";
import mongoose from "mongoose";
import ApiError from "../../utils/ApiError.js";
import { Conversation } from "../../models/conversation.model.js";
import {
  createOrGetDirectConversation,
} from "./conversation.service.js";

const PAGE_SIZE = 20;

const getGroupMessages = async (groupId, page = 1) => {
  const skip = (page - 1) * PAGE_SIZE;

  const messages = await GroupMessage.find({ group: groupId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(PAGE_SIZE)
    .lean();

  return messages;
};

const saveDirectMessage = async (payload) => {
  const { sender, receiver, text, type, ts, msgId } = payload;

  if (!text.trim()) {
    throw new Error("Message content cannot be empty");
  }

  const { conversation } = await createOrGetDirectConversation(sender, receiver);

  const message = {
    sender,
    receiver,
    conversationId: conversation._id,
    text,
    type,
    ts,
    msgId,
    clientMsgId: msgId,
  };

  await messageQueue.add("presis-message", message);

  await Conversation.updateOne(
    { _id: conversation._id },
    {
      $set: {
        lastMessage: {
          senderId: sender,
          text,
          type: "text",
          createdAt: ts || new Date(),
        },
        lastMessageAt: ts || new Date(),
      },
      $inc: {
        [`unreadCountByUser.${String(receiver)}`]: 1,
      },
    },
  );

  return {
    ...message,
    status: "sent",
  };
};

const markMessageDeliveredService = async ({ messageId, userId, conversationId }) => {
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new ApiError(400, "Invalid message id");
  }

  const now = new Date();
  const updated = await Message.findOneAndUpdate(
    {
      _id: messageId,
      receiver: userId,
      status: { $in: ["sent", "sending"] },
    },
    {
      $set: {
        status: "delivered",
        deliveredAt: now,
      },
    },
    { new: true, lean: true },
  );

  return {
    messageId,
    conversationId: conversationId || updated?.conversationId,
    sender: updated?.sender,
    receiver: updated?.receiver,
    status: "delivered",
    updatedAt: now,
  };
};

const markMessageReadService = async ({
  messageId,
  readUptoMessageId,
  userId,
  conversationId,
}) => {
  let convoId = conversationId;
  const now = new Date();

  if (messageId && mongoose.Types.ObjectId.isValid(messageId)) {
    const updated = await Message.findOneAndUpdate(
      {
        _id: messageId,
        receiver: userId,
        status: { $in: ["sent", "delivered", "sending"] },
      },
      {
        $set: {
          status: "read",
          readAt: now,
        },
      },
      { new: true, lean: true },
    );

    convoId = convoId || updated?.conversationId;
  }

  if (readUptoMessageId && mongoose.Types.ObjectId.isValid(readUptoMessageId)) {
    const anchor = await Message.findById(readUptoMessageId)
      .select("_id conversationId createdAt")
      .lean();

    if (anchor) {
      convoId = convoId || anchor.conversationId;

      await Message.updateMany(
        {
          conversationId: anchor.conversationId,
          receiver: userId,
          createdAt: { $lte: anchor.createdAt },
          status: { $in: ["sent", "delivered", "sending"] },
        },
        {
          $set: {
            status: "read",
            readAt: now,
          },
        },
      );
    }
  }

  if (convoId && mongoose.Types.ObjectId.isValid(convoId)) {
    await Conversation.updateOne(
      { _id: convoId },
      {
        $set: {
          [`unreadCountByUser.${String(userId)}`]: 0,
        },
      },
    );
  }

  return {
    messageId,
    readUptoMessageId,
    conversationId: convoId,
    status: "read",
    updatedAt: now,
  };
};

const saveGroupMessage = async (payload) => {
  const { sender, group, text, type, ts, msgId } = payload;

  if (!text.trim()) {
    throw new Error("Message content cannot be empty");
  }

  const message = {
    type,
    sender,
    group,
    text,
    ts,
    msgId,
  };

  await messageQueue.add("presis-message", message);

  return message;
};

const deleteOneService = async (msgId) => {
  try {
    const result = await Message.deleteOne({ msgId });

    if (result.deletedCount === 0) {
      throw new ApiError(404, "Message not found");
    }

    return { success: true, message: "Message deleted successfully" };
  } catch (error) {
    throw new ApiError(500, "Delete Message Error");
  }
};

const deleteAllService = async (chatId, userId) => {
  if (!userId || !chatId) {
    throw new ApiError(400, "Invalid IDs");
  }

  try {
    const result = await Message.deleteMany({
      $or: [
        { sender: userId, receiver: chatId },
        { sender: chatId, receiver: userId },
      ],
    });

    if (result.deletedCount === 0) {
      throw new ApiError(404, "No messages found to delete");
    }

    return {
      success: true,
      message: `${result.deletedCount} messages deleted`,
    };
  } catch (error) {
    throw new ApiError(500, "Delete Messages Error");
  }
};

export default {
  getGroupMessages,
  saveDirectMessage,
  saveGroupMessage,
  markMessageDeliveredService,
  markMessageReadService,
  deleteOneService,
  deleteAllService
};
