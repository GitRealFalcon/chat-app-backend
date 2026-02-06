import { User } from "../../models/user.model.js";
import ApiError from "../../utils/ApiError.js";
import { redisClient } from "../../config/redis.js";

const getUserById = async (userId) => {
    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return user;
}

const searchUsersByName = async (name) => {
    const user = await User.find({
        name: { $regex: name, $options: "i"}
    }).select("-password -refreshToken");

    return user;
}

const getOnlineUsers = async () => {
    const onlineUsers =  await redisClient.sMembers("online:users");
    return onlineUsers;
}

export default{
    getUserById,
    searchUsersByName,
    getOnlineUsers
}
