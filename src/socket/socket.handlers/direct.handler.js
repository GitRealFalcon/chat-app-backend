import socketEvents from "../../constants/socket.events.js";
import {
  publishDirectMessage,
  publishMessageStatusUpdate,
} from "../../redis/pubsub.js";
import messageService from "../../api/service/message.service.js";
import { resolveDirectReceiverFromConversation } from "../../api/service/conversation.service.js";
import { checkSocketEventRateLimit } from "../utils/eventRateLimiter.js";
import {
  hasNonEmptyString,
  validateSendPayload,
  validateStatusPayload,
} from "../validators/messageSocket.validator.js";

export default (io, socket) => {
  const onSendMessage = async (payload) => {
    try {
      const allowed = checkSocketEventRateLimit(socket, socketEvents.MESSAGE_SEND, {
        limit: 20,
        windowMs: 10_000,
      });

      if (!allowed) {
        socket.emit("error", "Too many messages. Please slow down.");
        return;
      }

      const validationError = validateSendPayload(payload);
      if (validationError) {
        socket.emit("error", validationError);
        return;
      }

      const sender = String(socket.user?._id);
      let receiver = payload.receiver;

      if (!hasNonEmptyString(receiver) && hasNonEmptyString(payload.conversationId)) {
        receiver = await resolveDirectReceiverFromConversation(
          payload.conversationId,
          sender,
        );
      }

      const clientMsgId = payload.clientMsgId || payload.msgId || `${Date.now()}-${socket.id}`;
      const message = {
        msgId: clientMsgId,
        clientMsgId,
        sender,
        receiver,
        conversationId: payload.conversationId,
        text: payload.text.trim(),
        type: "direct",
        ts: payload.ts || new Date(),
      };

      await publishDirectMessage(message, socket);
    } catch (error) {
      console.error("❌ DIRECT_MESSAGE handler error:", error);
      socket.emit("error", "Failed to send message");
    }
  };

  socket.on(socketEvents.MESSAGE_SEND, onSendMessage);
  socket.on(socketEvents.DIRECT_MESSAGE, onSendMessage);

  socket.on(socketEvents.MESSAGE_DELIVERED, async (payload) => {
    try {
      const allowed = checkSocketEventRateLimit(socket, socketEvents.MESSAGE_DELIVERED, {
        limit: 60,
        windowMs: 60_000,
      });

      if (!allowed) {
        socket.emit("error", "Too many delivered updates. Please slow down.");
        return;
      }

      const validationError = validateStatusPayload(payload);
      if (validationError || !hasNonEmptyString(payload.messageId)) {
        socket.emit("error", validationError || "messageId is required");
        return;
      }

      const statusPayload = await messageService.markMessageDeliveredService({
        messageId: payload.messageId,
        userId: String(socket.user?._id),
        conversationId: payload.conversationId,
      });

      await publishMessageStatusUpdate(statusPayload);
    } catch (error) {
      console.error("❌ MESSAGE_DELIVERED handler error:", error);
      socket.emit("error", "Failed to update delivered status");
    }
  });

  socket.on(socketEvents.MESSAGE_READ, async (payload) => {
    try {
      const allowed = checkSocketEventRateLimit(socket, socketEvents.MESSAGE_READ, {
        limit: 60,
        windowMs: 60_000,
      });

      if (!allowed) {
        socket.emit("error", "Too many read updates. Please slow down.");
        return;
      }

      const validationError = validateStatusPayload(payload);
      if (validationError) {
        socket.emit("error", validationError);
        return;
      }

      const statusPayload = await messageService.markMessageReadService({
        messageId: payload.messageId,
        readUptoMessageId: payload.readUptoMessageId,
        userId: String(socket.user?._id),
        conversationId: payload.conversationId,
      });

      await publishMessageStatusUpdate(statusPayload);
    } catch (error) {
      console.error("❌ MESSAGE_READ handler error:", error);
      socket.emit("error", "Failed to update read status");
    }
  });
};
