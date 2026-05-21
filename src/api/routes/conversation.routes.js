import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import conversationController from "../controller/conversation.controller.js";
import {
  validateCreateDirectConversation,
  validateCursorPagination,
} from "../validators/conversation.validator.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  validateCursorPagination,
  conversationController.getConversations,
);
router.get(
  "/:conversationId/messages",
  authMiddleware,
  validateCursorPagination,
  conversationController.getConversationMessages,
);
router.post(
  "/direct",
  authMiddleware,
  validateCreateDirectConversation,
  conversationController.createDirectConversation,
);

export default router;
