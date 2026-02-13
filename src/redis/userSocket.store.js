import { redisClient } from "../config/redis.js";
import { publishUserStatus } from "./pubsub.js";

const ONLINE_USERS_KEY = "online:users";

export const addUserSocket = async (userId, socketId) => {
  await redisClient.sAdd(ONLINE_USERS_KEY, userId);
  await redisClient.sAdd(`user:sockets:${userId}`, socketId);
};

export const removeUserSocket = async (userId, socketId) => {
await redisClient.sRem(`user:sockets:${userId}`, socketId);
const remainingSockets = await redisClient.sCard(`user:sockets:${userId}`);
if (remainingSockets === 0) {
  await redisClient.sRem(ONLINE_USERS_KEY, userId);
  await publishUserStatus({ userId, status: "offline" });
}

};

export const getUserSockets = async (userId) => {
  return await redisClient.sMembers(`user:sockets:${userId}`);
};

export const getRedisOnlineUsers = async () => {
  
  return await redisClient.sMembers(ONLINE_USERS_KEY);
};
