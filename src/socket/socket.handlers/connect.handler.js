import { addUserSocket } from "../../redis/userSocket.store.js";
import { removeUserSocket } from "../../redis/userSocket.store.js";
import { publishUserStatus } from "../../redis/pubsub.js";

export default async (io, socket) => {
  const userId = socket.user._id.toString();

  await addUserSocket(userId, socket.id);
  await publishUserStatus({
    userId,
    status:"online"
  })

  socket.on("disconnect", async (reason) => {
    await removeUserSocket(userId, socket.id);
  });
};
