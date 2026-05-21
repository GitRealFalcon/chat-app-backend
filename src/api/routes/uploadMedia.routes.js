import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { uploadArray, uploadSingle } from "../middleware/multer.middleware.js";
import uploadMediaController from "../controller/uploadMedia.controller.js";

const router = Router();

router.post(
  "/single",
  authMiddleware,
  uploadSingle("file"),
  uploadMediaController.uploadMedia,
);

router.post(
  "/multiple",
  authMiddleware,
  uploadArray("files", 5),
  uploadMediaController.uploadMultipleMedia,
);

export default router;