import mongoose from "mongoose";
import { User } from "../../models/user.model.js";
import ApiError from "../../utils/ApiError.js";
import { verifyRefreshToken } from "../../utils/jwt.service.js";

const registerUser = async (name, email, password) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User already Exists");
  }

  const newUser = new User({ email, password, name });
  await newUser.save();
  return newUser;
};

const loginUser = async (email, password) => {
  const isValidUser = await User.findOne({ email });
  if (!isValidUser) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await isValidUser.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Credentials");
  }

  const user = await User.aggregate([
    {$match:{_id:isValidUser._id}},
     {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "chats",
        as: "Chats",
        pipeline: [
          {
            $unset: ["password", "refreshToken", "chats", "joinedGroup"],
          },
        ],
      },
    },
    {
      $lookup: {
        from: "groups",
        foreignField: "_id",
        localField: "joinedGroup",
        as: "JoinedGroups",
        pipeline: [
          {
            $unset: ["members"],
          },
        ],
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        Chats: 1,
        JoinedGroups: 1,
      },
    },

  ])


  return {isValidUser,user:user[0]};
};

const logoutUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  user.refreshToken = null;
  await user.save();
  return;
};

const getCurrentUser = async (userId) => {
  const user = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "chats",
        as: "Chats",
        pipeline: [
          {
            $unset: ["password", "refreshToken", "chats", "joinedGroup"],
          },
        ],
      },
    },
    {
      $lookup: {
        from: "groups",
        foreignField: "_id",
        localField: "joinedGroup",
        as: "JoinedGroups",
        pipeline: [
          {
            $unset: ["members"],
          },
        ],
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        Chats: 1,
        JoinedGroups: 1,
      },
    },
  ]);
  if (!user[0]) {
    throw new ApiError(404, "User not found");
  }
  return user[0];
};

const createAccessToken = async (refreshToken)=>{
  try { 
    const decodedToken = verifyRefreshToken(refreshToken)
    const user = await User.findById(decodedToken.id)
    const accessToken = user.generateAccessToken()

    return accessToken
  } catch (error) {
    if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "REFRESH_TOKEN_EXPIRED");
        }
        throw new ApiError(401, error.message || "Invalid Refresh Token");
  }
}

export default {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  createAccessToken
};
