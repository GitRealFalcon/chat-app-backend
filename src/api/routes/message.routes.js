import messageController from "../controller/message.controller.js";
import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/direct/:peerId",
  authMiddleware,
  messageController.getDirectMessages,
);
router.get(
  "/group/:groupId",
  authMiddleware,
  messageController.getGroupMessages,
);
router.patch(
  "/update/:peerId",
  authMiddleware,
  messageController.updateMessageStatus,
);
router.delete("/one/:msgId", authMiddleware, messageController.deleteOne);
router.delete("/all/:chatId", authMiddleware, messageController.deleteAll);

export default router;
