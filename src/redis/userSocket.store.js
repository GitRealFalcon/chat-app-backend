import { redisClient } from "../config/redis.js";
import { publishUserStatus } from "./pubsub.js";

const ONLINE_USERS_KEY = "online:users";
const SOCKET_TTL = 90;

export const addUserSocket = async (userId, socketId) => {
  await redisClient.sAdd(ONLINE_USERS_KEY, userId);
  await redisClient.sAdd(`user:sockets:${userId}`, socketId);

  // per socket ttl key
  await redisClient.set(
    `socket:alive:${socketId}`,
    userId,
    { EX: SOCKET_TTL }
  );
};

export const refreshSocketTTL = async (socketId) => {
  await redisClient.expire(`socket:alive:${socketId}`, 90);
};

export const removeUserSocket = async (userId, socketId) => {
  await redisClient.del(`socket:alive:${socketId}`);

  await redisClient.sRem(`user:sockets:${userId}`, socketId);

  const remainingSockets = await redisClient.sCard(
    `user:sockets:${userId}`
  );

  if (remainingSockets === 0) {
    await redisClient.sRem(ONLINE_USERS_KEY, userId);

    await publishUserStatus({
      userId,
      status: "offline",
    });
  }
};

export const getUserSockets = async (userId) => {
  const socketIds = await redisClient.sMembers(
    `user:sockets:${userId}`
  );

  const validSockets = [];

  for (const socketId of socketIds) {
    const exists = await redisClient.exists(
      `socket:alive:${socketId}`
    );

    if (exists) {
      validSockets.push(socketId);
    } else {
      await redisClient.sRem(
        `user:sockets:${userId}`,
        socketId
      );
    }
  }

  return validSockets;
};

export const getRedisOnlineUsers = async () => { 
  return await redisClient.sMembers(ONLINE_USERS_KEY);
};
