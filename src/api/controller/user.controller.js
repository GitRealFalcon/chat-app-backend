import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiRespose.js";
import asyncHandler from "../../utils/asyncHandler.js";
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

const getOnlineUsers = asyncHandler(async (req,res)=>{
   const  onlineUsers = userService.getOnlineUsers()

   res.status(200)
   .json(new ApiResponse(200,"fetch online user sucssessfull", onlineUsers))
})


export default{
    getUserById,
    searchUsersByName,
    getOnlineUsers
}