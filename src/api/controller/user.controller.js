import mongoose from "mongoose";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiRespose.js";
import asyncHandler from "../../utils/asyncHandler.js";
import userService from "../service/user.service.js";


const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const user = await userService.getUserById(userId);
  res.status(200).json(new ApiResponse(200, "User fetched successfully", user));
});

const searchUsersByName = asyncHandler(async (req, res) => {
  const name = req.query.name;
  const users = await userService.searchUsersByName(name);
  res
    .status(200)
    .json(new ApiResponse(200, "Users fetched successfully", users));
});

const getOnlineUsers = asyncHandler(async (req, res) => {
  const onlineUsers = await userService.getOnlineUsers();
  res
    .status(200)
    .json(new ApiResponse(200, "fetch online user successful", onlineUsers));
});

const addContact = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { contact } = req.body;
  const { success } = await userService.addContactService({ userId, contact });
  if (!success) {
    throw new ApiError(404, "Update error");
  }

  res.status(200).json(new ApiResponse(200, "update successfully"));
});

const blockContact = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { contact } = req.body;
  const response = await userService.blockContactService({ userId, contact });

  if (!response) {
    throw new ApiError(404, "Block error");
  }

  res.status(200).json(new ApiResponse(200, "Block successfully"));
});

const unBlockContact = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { contact } = req.body;
  const response = await userService.unBlockContactService({ userId, contact });

  if (!response) {
    throw new ApiError(404, "unBlock error");
  }
  res.status(200).json(new ApiResponse(200, "unBlock successfully"));
});

const friendRequest = asyncHandler(async (req, res) => {
  const reqId = req.params.reqId;
  const userId = req.user?._id;

  const response = await userService.requestService(reqId, userId);

  res.status(200)
  .json(new ApiResponse(200,"Friend request send"))
});

const acceptRequest = asyncHandler(async(req,res)=>{
  const reqId = req.params.reqId;
  const userId = req.user?._id;

  const response = await userService.acceptRequestService(reqId,userId)
  res.status(200)
  .json(new ApiResponse(200,"Friend request accepted"))
})

const rejectRequest = asyncHandler(async(req,res)=>{
  const reqId = req.params.reqId;
  const userId = req.user?._id;

  const response = await userService.rejectRequestService(reqId, userId)
  res.status(200)
  .json(new ApiResponse(200,"Friend request rejected"))
})

export default {
  getUserById,
  searchUsersByName,
  getOnlineUsers,
  addContact,
  blockContact,
  unBlockContact,
  friendRequest,
  acceptRequest,
  rejectRequest
};
