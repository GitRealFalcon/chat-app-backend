import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import friendRequestController from "../controller/friendRequest.controller.js";

const router = Router()

router.post("/sent/:reqId",authMiddleware,friendRequestController.friendRequest)
router.get("/get",authMiddleware,friendRequestController.getRequests)
router.patch("/accept/:reqId",authMiddleware,friendRequestController.acceptRequest)
router.patch("/reject/:reqId",authMiddleware,friendRequestController.rejectRequest)
router.patch("/cancel/:reqId",authMiddleware,friendRequestController.cancelRequest)

export default router