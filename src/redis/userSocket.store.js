import { redisClient } from "../config/redis";

const ONLINE_USERS_KEY = "online:users";
const USER_SOCKETS_KEY = (userId)=> `user:sockets:${userId}`;

export const addUserSocket = async (userId, socketId)=>{
    await redisClient.sAdd(ONLINE_USERS_KEY,userId)
    await redisClient.sAdd(USER_SOCKETS_KEY(userId),socketId)
}

export const removeUserSocket = async (userId, socketId)=>{
    await redisClient.sRem(USER_SOCKETS_KEY(userId),socketId)
    const remeiningSockets = await redisClient.sCard(USER_SOCKETS_KEY(userId))
    if(remeiningSockets === 0){
        await redisClient.sRem(ONLINE_USERS_KEY,userId)
    }
}

export const getUserSockets = async (userId)=>{
    return await redisClient.sMembers(USER_SOCKETS_KEY(userId))
}

export const getOnlineUsers = async()=>{
    return await redisClient.sMembers(ONLINE_USERS_KEY)
}