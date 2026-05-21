import messageController from "../controller/message.controller.js";
import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { validateMessageStatusBody } from "../validators/message.validator.js";

const router = Router();

router.get(
  "/group/:groupId",
  authMiddleware,
  messageController.getGroupMessages,
);
router.patch(
  "/status",
  authMiddleware,
  validateMessageStatusBody,
  messageController.updateMessageStatusV2,
);
router.delete("/one/:msgId", authMiddleware, messageController.deleteOne);
router.delete("/all/:chatId", authMiddleware, messageController.deleteAll);

export default router;
