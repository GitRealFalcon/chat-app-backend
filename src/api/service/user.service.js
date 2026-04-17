import { User } from "../../models/user.model.js";
import ApiError from "../../utils/ApiError.js";
import { getRedisOnlineUsers } from "../../redis/userSocket.store.js";
import mongoose from "mongoose";
import { redisClient } from "../../config/redis.js";

const getUserById = async (userIds) => {
  const validUserIds = userIds.map((id) => new mongoose.Types.ObjectId(id));
  const user = await User.aggregate([
    { $match: { _id: { $in: validUserIds } } },
    { $project: {} },
  ]);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const searchUsersByName = async (name, page = 1, limit = 10) => {
  if (!name || name.trim().length < 2) return [];

  const safeName = escapeRegex(name.trim());

  return User.find({
    name: { $regex: safeName, $options: "i" },
  })
    .select("-password -refreshToken -contacts -joinedGroup -chats -block")
    .skip((page - 1) * limit)
    .limit(limit);
};

const getOnlineUsers = async () => {
  const onlineUsers = await getRedisOnlineUsers();
  return onlineUsers;
};

const blockContactService = async (chatId, userId) => {
  let session = await mongoose.startSession();

  try {
    const result = await session.withTransaction(async () => {
      const user = await User.findOneAndUpdate(
        { _id: userId },
        { $addToSet: { block: chatId } },
        { session, new: true },
      );
      return user;
    });
    const userIdStr = userId.toString()
const chatIdStr = chatId.toString()
    await Promise.all([
      redisClient.sAdd(`blocked:${userIdStr}`, chatIdStr),
      redisClient.sAdd(`blockedBy:${chatIdStr}`, userIdStr),
    ]);
    return { success: true, message: "Contact Unblock success" };
  } catch (error) {
    throw new ApiError(500, "Block Contact Error");
  } finally {
    session.endSession();
  }
};

const unBlockContactService = async (chatId, userId) => {
  let session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await User.updateOne(
        { _id: userId },
        { $pull: { block: chatId } },
        { session },
      );
    });
    const userIdStr = userId.toString()
const chatIdStr = chatId.toString()

    await Promise.all([
      redisClient.sRem(`blocked:${userIdStr}`, chatIdStr),
      redisClient.sRem(`blockedBy:${chatIdStr}`, userIdStr),
    ]);

    return { success: true, message: "Contact Unblock success" };
  } catch (error) {
    throw new ApiError(500, "unBlock Contact Error");
  } finally {
    session.endSession();
  }
};

export default {
  getUserById,
  searchUsersByName,
  getOnlineUsers,
  blockContactService,
  unBlockContactService,
};
