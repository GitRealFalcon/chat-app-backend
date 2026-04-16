import {
  addUserSocket,
  removeUserSocket
} from "../../redis/userSocket.store.js";
import { publishUserStatus } from "../../redis/pubsub.js";
import { refreshSocketTTL } from "../../redis/userSocket.store.js";

export default (io, socket) => {
  const userId = socket.user._id.toString();

  // personal room
  socket.join(`user:${userId}`);

  // group rooms
  const rooms = socket.user.joinedGroup.map(
    group => `room:${group._id}`
  );
  socket.join(rooms);

  // redis socket tracking
  addUserSocket(userId, socket.id).catch(console.error);

  // online presence
  publishUserStatus({
    userId,
    status: "online",
  }).catch(console.error);

  const heartbeat = setInterval(async () => {
  if (socket.connected) {
    await refreshSocketTTL(socket.id);
  }
}, 30000);

  socket.on("disconnect", () => {
    clearInterval(heartbeat)
    removeUserSocket(userId, socket.id).catch(console.error);
  });
};