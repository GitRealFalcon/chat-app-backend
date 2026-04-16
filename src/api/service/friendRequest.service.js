import mongoose from "mongoose";
import { FriendRequest } from "../../models/friendRequest.model.js";
import ApiError from "../../utils/ApiError.js";
import { User } from "../../models/user.model.js";

const requestService = async (reqId, userId) => {
  try {
    const isExist = await FriendRequest.findOne({
      requestSender: userId,
      requestReceiver: reqId,
      status: "pending",
    });

    if (isExist) {
      throw new ApiError(409, "Friend Request already sent");
    }

    const result = await FriendRequest.create({
      requestSender: userId,
      requestReceiver: reqId,
    });

    return { success: true, message: "Friend request send" };
  } catch (error) {
    throw new ApiError(500, "Request send Error");
  }
};

const acceptRequestService = async (requestId, userId) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const request = await FriendRequest.findOne({
        _id: requestId,
        requestReceiver: userId,
        status: "pending",
      }).session(session);

      if (!request) {
        throw new ApiError(404, "Friend request not found");
      }

      // add both users to chats
      await User.updateOne(
        { _id: request.requestSender },
        { $addToSet: { chats: userId } },
        { session },
      );

      await User.updateOne(
        { _id: userId },
        { $addToSet: { chats: request.requestSender } },
        { session },
      );

      // update request status
      await FriendRequest.updateOne(
        { _id: requestId },
        { $set: { status: "accepted" } },
        { session },
      );
    });

    return {
      success: true,
      message: "Friend request accepted",
    };
  } catch (error) {
    console.log(error);
    
    throw error instanceof ApiError
      ? error
      : new ApiError(500, "Accept friend request error");
  } finally {
    await session.endSession();
  }
};

const rejectRequestService = async (requestId, userId) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const result = await FriendRequest.updateOne(
        {
          _id: requestId,
          requestReceiver: userId,
          status: "pending",
        },
        {
          $set: { status: "rejected" },
        },
        { session },
      );

      if (result.modifiedCount === 0) {
        throw new ApiError(404, "Request not found");
      }
    });

    return {
      success: true,
      message: "Friend request rejected",
    };
  } catch (error) {
    throw error instanceof ApiError
      ? error
      : new ApiError(500, "Reject Friend Request Error");
  } finally {
    await session.endSession();
  }
};
const cancelRequestService = async (requestId, userId) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const result = await FriendRequest.updateOne(
        {
          _id: requestId,
          requestSender: userId,
          status: "pending",
        },
        {
          $set: { status: "canceled" },
        },
        { session },
      );

      if (result.modifiedCount === 0) {
        throw new ApiError(404, "Request not found");
      }
    });

    return {
      success: true,
      message: "Friend request canceled",
    };
  } catch (error) {
    throw error instanceof ApiError
      ? error
      : new ApiError(500, "Canceled Friend Request Error");
  } finally {
    await session.endSession();
  }
};

const getFriendRequestService = async (userId) => {
  try {
    const requests = await FriendRequest.find({
      $or: [{ requestSender: userId }, { requestReceiver: userId }],
    })
      .populate("requestSender", "name email")
      .populate("requestReceiver", "name email")
      .sort({ createdAt: -1 });
      return requests
  } catch (error) {
    throw error instanceof ApiError
      ? error
      : new ApiError(500, "Get Friend Request Error");
  }
};

export default {
  requestService,
  acceptRequestService,
  rejectRequestService,
  getFriendRequestService,
  cancelRequestService
};
