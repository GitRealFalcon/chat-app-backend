import { User } from "../../models/user.model.js";
import ApiError from "../../utils/ApiError.js";
import { getRedisOnlineUsers } from "../../redis/userSocket.store.js";
import mongoose from "mongoose";

const getUserById = async (userIds) => {
  const validUserIds = userIds.map((id) => new mongoose.Types.ObjectId(id));
  const user = await User.aggregate([
    { $match: { _id: { $in: validUserIds } } },
    {$project:{
      
    }},
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


const blockContactService = async (data) => {
  let { contact, userId } = data;
  let session = await mongoose.startSession();
  contact = new mongoose.Types.ObjectId(contact);
  userId = new mongoose.Types.ObjectId(userId);

  try {
    await session.withTransaction(async()=>{
      await User.updateOne(
      { _id: userId },
      { $addToSet: { block: contact } },
      { session },
    );
    })
    
    return { success: true, message: "Contact Unblock success" }
  } catch (error) {
    throw new ApiError(500,"Block Contact Error")
  }finally{
    session.endSession()
  }
};

const unBlockContactService = async (data) => {
  let { contact, userId } = data;
  let session = await mongoose.startSession();
  contact = new mongoose.Types.ObjectId(contact);
  userId = new mongoose.Types.ObjectId(userId);

  try {
    await session.withTransaction(async()=>{
      await User.updateOne(
      { _id: userId },
      { $pull: { block: contact } },
      { session },
    );
    })
    return { success: true, message: "Contact Unblock success" }
  } catch (error) {
     throw new ApiError(500,"unBlock Contact Error")
  }finally{
    session.endSession()
  }
};

const requestService = async (reqId, userId) => {
  const session = await mongoose.startSession();
  try {
   await session.withTransaction(async () => {
       await User.updateOne(
        { _id: reqId },
        { $addToSet: { chatRequests: userId } },
        { session },
      );
      
    });

    return { success: true, message: "Friend request send" }
  } catch (error) {
    throw new ApiError(500, "Request send Error");
  } finally {
    session.endSession();
  }
};

const acceptRequestService = async (reqId, userId) => {
  const session = await mongoose.startSession();

  try {
   await session.withTransaction(async () => {
       await User.updateOne(
        { _id: userId },
        { $pull: { chatRequests: reqId } },
        { session },
      );

       await User.updateOne(
        {_id:reqId},
        {$addToSet: {chats: userId}},
        {session}
      )
      await User.updateOne(
        {_id:userId},
        {$addToSet: {chats:reqId}},
        {session}
      )

      
    });
    return { success: true, message: "Friend request accepted" }
  } catch (error) {
    throw new ApiError(500,"Accept Friend Request Error")
  }finally{
    session.endSession()
  }
};

const rejectRequestService = async(reqId,userId)=>{
  const session = await mongoose.startSession()
  try {
    await session.withTransaction(async()=>{
      await User.updateOne(
        {_id:userId},
        {$pull: {chatRequests:reqId}},
        {session}
      )
    })
     return { success: true, message: "Friend request rejected" }
  } catch (error) {
    throw new ApiError(500,"Reject Friend Request Error")
  }finally{
    session.endSession()
  }
}

export default {
  getUserById,
  searchUsersByName,
  getOnlineUsers,
  blockContactService,
  unBlockContactService,
  requestService,
  acceptRequestService,
  rejectRequestService
};
