import mongoose from "mongoose";
import { User } from "../../models/user.model.js";
import ApiError from "../../utils/ApiError.js";
import { verifyRefreshToken } from "../../utils/jwt.service.js";
import { sendVerificationCode } from "../../helpers/sendVerificationCode.js";

const registerUser = async (name, email, password) => {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, "User already Exists");
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const verificationExpiry = new Date(Date.now() + 5 * 60 * 1000);
    const newUser = new User({
      email,
      password,
      name,
      verificationCode,
      verificationExpiry,
    });
    await newUser.save();
    const res = await sendVerificationCode(verificationCode, email, name);
    if (!res.success) {
      throw new ApiError(400, res.message);
    }
    return newUser;
  } catch (error) {
    throw new ApiError(500, error.message || "Registration Failed");
  }
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
    { $match: { _id: isValidUser._id } },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "chats",
        as: "Chats",
        pipeline: [
          {
            $project: {
              name: 1,
              email: 1,
              isVerified: 1
            },
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
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "block",
        as: "Blocked",
        pipeline: [
          {
             $project: {
              name: 1,
              email: 1,
              isVerified: 1
            },
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
        Blocked: 1,
        isVerified: 1
      },
    },
  ]);

  return { isValidUser, user: user[0] };
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
             $project: {
              name: 1,
              email: 1,
              isVerified: 1
            },
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
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "block",
        as: "Blocked",
        pipeline: [
          {
             $project: {
              name: 1,
              email: 1,
              isVerified: 1
            },
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
        Blocked: 1,
        isVerified: 1
      },
    },
  ]);
  if (!user[0]) {
    throw new ApiError(404, "User not found");
  }
  return user[0];
};

const createAccessToken = async (refreshToken) => {
  try {
    const decodedToken = verifyRefreshToken(refreshToken);
    const user = await User.findById(decodedToken.id);
    const accessToken = user.generateAccessToken();

    return accessToken;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "REFRESH_TOKEN_EXPIRED");
    }
    throw new ApiError(401, error.message || "Invalid Refresh Token");
  }
};

const verificationCodeService = async (email, code) => {
  try {
    const isExist = await User.findOne({
      email,
    });

    if (!isExist) {
      throw new ApiError(404, "user not found");
    }

    if (isExist.isVerified) {
      throw new ApiError(400, "Already verified");
    }

    const { verificationCode, verificationExpiry } = isExist;
    if (String(verificationCode) !== code) {
      throw new ApiError(400, "Invalid OTP");
    }
    if (Date.now() > verificationExpiry) {
      throw new ApiError(410, "OTP expired");
    }

    isExist.set({
      verificationCode: null,
      verificationExpiry: null,
      isVerified: true,
    });

    await isExist.save();

    return {
      success: true,
      message: "OTP verified successfully",
    };
  } catch (error) {
    throw new ApiError(500, error.message || "OTP Verification Failed");
  }
};

const generateVerificationCodeService = async (email) => {
  try {
    const isExist = await User.findOne({
      email,
    });

    if (!isExist) {
      throw new ApiError(404, "user not found");
    }

    if (isExist.isVerified) {
      throw new ApiError(400, "Already verified");
    }

    const { name } = isExist;

    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const verificationExpiry = new Date(Date.now() + 5 * 60 * 1000);

    isExist.set({
      verificationCode,
      verificationExpiry,
    });

    await isExist.save();
    const res = await sendVerificationCode(verificationCode, email, name);
    if (!res.success) {
      throw new ApiError(400, res.message);
    }

    return verificationExpiry;
  } catch (error) {
    throw new ApiError(500, error.message || "OTP generate Failed");
  }
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  createAccessToken,
  verificationCodeService,
  generateVerificationCodeService,
};
