import { addUserSocket } from "../../redis/userSocket.store.js";
import { removeUserSocket } from "../../redis/userSocket.store.js";
import { publishUserStatus } from "../../redis/pubsub.js";

export default (io, socket) => {
  const userId = socket.user._id.toString();
  socket.on("disconnecting", async (reason) => {
     removeUserSocket(userId, socket.id).catch(console.error);
  });

  addUserSocket(userId, socket.id).catch(console.error);
  publishUserStatus({
    userId,
    status:"online"
  }).catch(console.error)

  
};
