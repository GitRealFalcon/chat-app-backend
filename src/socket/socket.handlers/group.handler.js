import socketEvents from "../../constants/socket.events.js";
import { publishGroupMessage } from "../../redis/pubsub.js";
import { checkSocketEventRateLimit } from "../utils/eventRateLimiter.js";
export default (io, socket) => {
  socket.on(socketEvents.GROUP_MESSAGE, async (payload) => {
    try {
      const allowed = checkSocketEventRateLimit(socket, socketEvents.GROUP_MESSAGE, {
        limit: 20,
        windowMs: 10_000,
      });

      if (!allowed) {
        socket.emit("error", "Too many group messages. Please slow down.");
        return;
      }

      await publishGroupMessage(payload);
    } catch (error) {
      console.error("❌ GROUP_MESSAGE handler error:", error);
      socket.emit("error", "Failed to send group message");
    }
  });
};
