import { User } from "../../models/user.model.js";
import ApiError from "../../utils/ApiError.js";
import { getRedisOnlineUsers } from "../../redis/userSocket.store.js";
import mongoose from "mongoose";

const getUserById = async (userIds) => {
  const validUserIds = userIds.map((id) => new mongoose.Types.ObjectId(id));
  const user = await User.aggregate([
    { $match: { _id: { $in: validUserIds } } },
    {},
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
    .select("-password -refreshToken")
    .skip((page - 1) * limit)
    .limit(limit);
};

const getOnlineUsers = async () => {
  const onlineUsers = await getRedisOnlineUsers();
  return onlineUsers;
};

const addConatactService = async (data) => {
  
  let { contact, userId } = data;
  const session = await mongoose.startSession();
  session.startTransaction();
 
  contact = new mongoose.Types.ObjectId(contact)
  userId = new mongoose.Types.ObjectId(userId)
  
  try {
    const resA = await User.updateOne(
      { _id: userId },
      { $addToSet: { chats: contact } },
      { session },
    );

    const resB = await User.updateOne(
      { _id: contact },
      { $addToSet: { chats: userId } },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return { success: false };
  }
};

export default {
  getUserById,
  searchUsersByName,
  getOnlineUsers,
  addConatactService
  
};
