import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiRespose";
import asyncHandler from "../../utils/asyncHandler";
import userService from "../service/user.service.js";

const getUserById = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const user = await userService.getUserById(userId);
    res.status(200).json(new ApiResponse(200, "User fetched successfully", user));
})

const searchUsersByName = asyncHandler(async (req, res) => {
    const name = req.query.name;
    const users = await userService.searchUsersByName(name);
    res.status(200).json(new ApiResponse(200, "Users fetched successfully", users));
})


export default{
    getUserById,
    searchUsersByName,
}