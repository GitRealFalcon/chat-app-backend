import userController from "../controller/user.controller.js";
import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";


const router = Router();

router.get("/:userId/user", authMiddleware, userController.getUserById);
router.get("/search", authMiddleware, userController.searchUsersByName);
router.get("/onlineUser",authMiddleware,userController.getOnlineUsers)

export default router;