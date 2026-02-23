import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiRespose.js";
import asyncHandler from "../../utils/asyncHandler.js";
import userService from "../service/user.service.js";
import addConatactService from "../service/user.service.js";

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
    .json(new ApiResponse(200, "fetch online user sucssessfull", onlineUsers));
});

const addContact = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { contact } = req.body;

  const { success } = await userService.addConatactService({userId,contact})

  if (!success) {
    throw new ApiError(404, "Update error");
  }

  res.status(200).json(new ApiResponse(200, "update successfully"));
});
export default {
  getUserById,
  searchUsersByName,
  getOnlineUsers,
  addContact,
};
