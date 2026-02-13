import { redisPub, redisSub } from "../config/redis.js";
import { REDIS_CHANNELS } from "../constants/redis.channels.js";
import socketEvents from "../constants/socket.events.js";
import { getUserSockets } from "./userSocket.store.js";
import messageService from "../api/service/message.service.js";

export const publishDirectMessage = async (payload) => {
  await redisPub.publish(
    REDIS_CHANNELS.DIRECT_MESSAGE,
    JSON.stringify(payload),
  );
  await messageService.saveDirectMessage(payload);
};

export const publishGroupMessage = async (payload) => {
  await redisPub.publish(REDIS_CHANNELS.GROUP_MESSAGE, JSON.stringify(payload));
  await messageService.saveGroupMessage(payload);
};

export const publishUserStatus = async (payload) => {
  await redisPub.publish(REDIS_CHANNELS.USER_STATUS, JSON.stringify(payload));
};

export const publshTypingStatus = async (payload) => {
  await redisPub.publish(REDIS_CHANNELS.TYPING_STATUS, JSON.stringify(payload));
};

export const initRedisSubscriber = (io) => {
  redisSub.subscribe(REDIS_CHANNELS.DIRECT_MESSAGE, async (message) => {
  try {
    const payload = JSON.parse(message);

    const { sender, receiver } = payload;

    const senderSockets = await getUserSockets(sender);
    const receiverSockets = await getUserSockets(receiver);

    // Emit to sender
    senderSockets.forEach((socketId) => {
      io.to(socketId).emit(socketEvents.DIRECT_MESSAGE, payload);
    });

    // Emit to receiver
    receiverSockets.forEach((socketId) => {
      io.to(socketId).emit(socketEvents.DIRECT_MESSAGE, payload);
    });

  } catch (error) {
    console.error("❌ Redis DIRECT_MESSAGE error:", error);
  }
});


  redisSub.subscribe(REDIS_CHANNELS.GROUP_MESSAGE, (message) => {
    try {
      const payload = JSON.parse(message);
      const { groupId } = payload;

      io.to(`room:${groupId}`).emit(socketEvents.GROUP_MESSAGE, payload);
    } catch (error) {
      console.error("❌ Redis GROUP_MESSAGE error:", err);
    }
  });

  redisSub.subscribe(REDIS_CHANNELS.USER_STATUS, (message) => {
    try {
      const payload = JSON.parse(message);
      const { status } = payload;

      if (status === "offline") {
        io.emit(socketEvents.USER_OFFLINE, payload);
      } else {
        io.emit(socketEvents.USER_ONLINE, payload);
      }
    } catch (error) {
      console.error("❌ Redis USER_STATUS error:", err);
    }
  });

redisSub.subscribe(REDIS_CHANNELS.TYPING_STATUS, async (message) => {
  try {
    const payload = JSON.parse(message)
    const { type, userId, chatId, chatType } = payload

    if (chatType === "direct") {

      // chatId is receiver in direct chat
      const receiverSockets = await getUserSockets(chatId)

      receiverSockets.forEach((socketId) => {
        io.to(socketId).emit(type, payload)
      })
    }

    if (chatType === "group") {
      io.to(`group:${chatId}`).emit(type, payload)
    }

  } catch (err) {
    console.error("Typing Redis error:", err)
  }
})



  console.log("✅ Redis Pub/Sub subscribers initialized");
};
