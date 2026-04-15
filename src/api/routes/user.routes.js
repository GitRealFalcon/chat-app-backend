import userController from "../controller/user.controller.js";
import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";


const router = Router();

router.get("/:userId/user", authMiddleware, userController.getUserById);
router.get("/search", authMiddleware, userController.searchUsersByName);
router.get("/onlineUser",authMiddleware,userController.getOnlineUsers)
router.patch("/add",authMiddleware,userController.addContact)
router.patch("/block",authMiddleware,userController.blockContact)
router.patch("/unblock",authMiddleware,userController.unBlockContact)
router.patch("/request/:reqId",authMiddleware,userController.friendRequest)
router.patch("/accept/:reqId",authMiddleware,userController.acceptRequest)
router.patch("/reject/:reqId",authMiddleware,userController.rejectRequest)

export default router;