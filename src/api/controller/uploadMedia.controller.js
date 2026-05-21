import ApiResponse from "../../utils/ApiRespose.js";
import ApiError from "../../utils/ApiError.js";
import asyncHandler from "../../utils/asyncHandler.js";
import uploadMediaService from "../service/uploadMedia.service.js";

const uploadMedia = asyncHandler(async (req, res) => {
  const file = req.file;

  if (!file) {
    throw new ApiError(400, "No file uploaded");
  }

  const folder = req.body?.folder || "chatapp/media";
  const uploadedFile = await uploadMediaService.uploadMediaService(file, folder);

  res
    .status(200)
    .json(new ApiResponse(200, "Media uploaded successfully", uploadedFile));
});

const uploadMultipleMedia = asyncHandler(async (req, res) => {
  const files = Array.isArray(req.files) ? req.files : [];

  if (!files.length) {
    throw new ApiError(400, "No files uploaded");
  }

  const folder = req.body?.folder || "chatapp/media";
  const uploadedFiles = await Promise.all(
    files.map((file) => uploadMediaService.uploadMediaService(file, folder)),
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Media uploaded successfully", uploadedFiles));
});

export default {
  uploadMedia,
  uploadMultipleMedia,
};
