import socketEvents from "../../constants/socket.events.js";
import { publshTypingStatus } from "../../redis/pubsub.js";
import { checkSocketEventRateLimit } from "../utils/eventRateLimiter.js";

export default (io, socket) => {
  socket.on(socketEvents.TYPING_START, async (payload) => {
    const allowed = checkSocketEventRateLimit(socket, socketEvents.TYPING_START, {
      limit: 30,
      windowMs: 10_000,
    });

    if (!allowed) {
      return;
    }

    await publshTypingStatus({
      type: socketEvents.TYPING_START,
      ...payload,
    });
  });

  socket.on(socketEvents.TYPING_STOP, async (payload) => {
    const allowed = checkSocketEventRateLimit(socket, socketEvents.TYPING_STOP, {
      limit: 30,
      windowMs: 10_000,
    });

    if (!allowed) {
      return;
    }

    await publshTypingStatus({
      type: socketEvents.TYPING_STOP,
      ...payload,
    });
  });
};
