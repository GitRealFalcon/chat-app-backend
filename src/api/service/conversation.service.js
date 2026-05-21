import crypto from "crypto";
import mongoose from "mongoose";
import ApiError from "../../utils/ApiError.js";
import { Conversation } from "../../models/conversation.model.js";
import { Message } from "../../models/message.model.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export const createParticipantHash = (userA, userB) => {
  const ids = [String(userA), String(userB)].sort((a, b) => a.localeCompare(b));

  return crypto
    .createHash("sha256")
    .update(ids.join(":"))
    .digest("hex");
};

export const getDirectConversationBetweenUsers = async (userA, userB) => {
  if (!mongoose.Types.ObjectId.isValid(userA) || !mongoose.Types.ObjectId.isValid(userB)) {
    throw new ApiError(400, "Invalid user id for conversation");
  }

  const participantHash = createParticipantHash(userA, userB);
  return Conversation.findOne({ participantHash });
};

export const resolveDirectReceiverFromConversation = async (conversationId, senderId) => {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new ApiError(400, "Invalid conversation id");
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: senderId,
  })
    .select("participants")
    .lean();

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const receiver = (conversation.participants || []).find(
    (participant) => String(participant) !== String(senderId),
  );

  if (!receiver) {
    throw new ApiError(400, "Conversation peer not found");
  }

  return String(receiver);
};

const parseCursor = (cursor) => {
  if (!cursor) return null;

  const [timestamp, id] = String(cursor).split("_");
  const date = new Date(timestamp);

  if (!id || Number.isNaN(date.getTime()) || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid cursor");
  }

  return { date, id: new mongoose.Types.ObjectId(id) };
};

export const createOrGetDirectConversation = async (userA, userB) => {
  if (!mongoose.Types.ObjectId.isValid(userA) || !mongoose.Types.ObjectId.isValid(userB)) {
    throw new ApiError(400, "Invalid user id for conversation");
  }

  if (String(userA) === String(userB)) {
    throw new ApiError(400, "You cannot create a conversation with yourself");
  }

  const participantHash = createParticipantHash(userA, userB);

  let conversation = await Conversation.findOne({ participantHash });

  if (conversation) {
    return { conversation, created: false };
  }

  try {
    conversation = await Conversation.create({
      participants: [userA, userB],
      participantHash,
      createdBy: userA,
      unreadCountByUser: {
        [String(userA)]: 0,
        [String(userB)]: 0,
      },
    });

    return { conversation, created: true };
  } catch (error) {
    if (error?.code === 11000) {
      const existing = await Conversation.findOne({ participantHash });
      if (existing) {
        return { conversation: existing, created: false };
      }
    }

    throw error;
  }
};

const createDirectConversationService = async (participantId, userId) => {
  const { conversation, created } = await createOrGetDirectConversation(userId, participantId);

  return {
    created,
    conversation,
  };
};

const getConversationsService = async (userId, cursor, limit = DEFAULT_LIMIT) => {
  const parsedLimit = Math.min(Math.max(Number(limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const parsedCursor = parseCursor(cursor);

  const query = { participants: userId };

  if (parsedCursor) {
    query.$or = [
      { lastMessageAt: { $lt: parsedCursor.date } },
      {
        lastMessageAt: parsedCursor.date,
        _id: { $lt: parsedCursor.id },
      },
    ];
  }

  const conversations = await Conversation.find(query)
    .sort({ lastMessageAt: -1, _id: -1 })
    .limit(parsedLimit + 1)
    .populate("participants", "name displayName avatarUrl email isOnline lastSeenAt")
    .lean();

  const hasMore = conversations.length > parsedLimit;
  const items = hasMore ? conversations.slice(0, parsedLimit) : conversations;

  const mappedItems = items.map((conversation) => {
    const peer = (conversation.participants || []).find(
      (participant) => String(participant._id) !== String(userId),
    );

    return {
      conversationId: conversation._id,
      type: conversation.type,
      peer,
      lastMessage: conversation.lastMessage,
      lastMessageAt: conversation.lastMessageAt,
      unreadCount:
        conversation.unreadCountByUser?.[String(userId)] ??
        conversation.unreadCountByUser?.get?.(String(userId)) ??
        0,
    };
  });

  const last = mappedItems[mappedItems.length - 1];
  const nextCursor = hasMore && last
    ? `${new Date(last.lastMessageAt).toISOString()}_${String(last.conversationId)}`
    : null;

  return {
    items: mappedItems,
    hasMore,
    nextCursor,
  };
};

const getConversationMessagesService = async (
  conversationId,
  userId,
  cursor,
  limit = DEFAULT_LIMIT,
) => {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new ApiError(400, "Invalid conversation id");
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  }).lean();

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const parsedLimit = Math.min(Math.max(Number(limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const parsedCursor = parseCursor(cursor);

  const query = { conversationId };

  if (parsedCursor) {
    query.$or = [
      { createdAt: { $lt: parsedCursor.date } },
      {
        createdAt: parsedCursor.date,
        _id: { $lt: parsedCursor.id },
      },
    ];
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(parsedLimit + 1)
    .lean();

  const hasMore = messages.length > parsedLimit;
  const items = hasMore ? messages.slice(0, parsedLimit) : messages;

  const last = items[items.length - 1];
  const nextCursor = hasMore && last
    ? `${new Date(last.createdAt).toISOString()}_${String(last._id)}`
    : null;

  return {
    conversationId,
    items,
    hasMore,
    nextCursor,
  };
};

export default {
  createDirectConversationService,
  getConversationsService,
  getConversationMessagesService,
};
