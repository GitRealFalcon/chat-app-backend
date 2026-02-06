import authController from "../controller/auth.controller";
import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authMiddleware, authController.logout);
router.get("/me", authMiddleware, authController.Me);

export default router;