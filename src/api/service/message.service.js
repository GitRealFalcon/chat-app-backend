import { Message } from "../../models/message.model.js";
import { GroupMessage } from "../../models/groupMessage.model.js";
import { redisClient } from "../../config/redis.js";
import { messageQueue } from "../../queues/message.queue.js";
import mongoose from "mongoose";
import ApiError from "../../utils/ApiError.js";

const PAGE_SIZE = 20;
const getDirectMessages = async (userId, peerId, page = 1) => {
  const skip = (page - 1) * PAGE_SIZE;

  const messages = await Message.find({
    $or: [
      { sender: userId, receiver: peerId },
      { sender: peerId, receiver: userId },
    ],
  })
    .skip(skip)
    .limit(PAGE_SIZE)
    .lean();

  return messages;
};

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

  const message = {
    sender,
    receiver,
    text,
    type,
    ts,
    msgId,
  };

  const job = await messageQueue.add("presis-message", message);

  return message;
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

const updateMessageStatusService = async (peerId, userId) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await Message.updateMany(
        {
          sender: peerId,
          receiver: userId,
          status: "sent",
        },
        {
          $set: {
            status: "read",
          },
        },
        { session },
      );
    });
  } catch (error) {
    throw new ApiError(500, "Message Status update Error");
  } finally {
    await session.endSession();
  }
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
  getDirectMessages,
  getGroupMessages,
  saveDirectMessage,
  saveGroupMessage,
  updateMessageStatusService,
  deleteOneService,
  deleteAllService
};
