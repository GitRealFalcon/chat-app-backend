import fs from "fs/promises";
import path from "path";
import ApiError from "../../utils/ApiError.js";
import cloudinary from "../../lib/cloudinary.js";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "../../config/env.js";

const ensureCloudinaryConfig = () => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new ApiError(500, "Cloudinary configuration is missing");
  }
};

const inferResourceType = (mimeType = "") => {
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("image/")) return "image";
  return "raw";
};

const uploadMediaService = async (file, folder = "chatapp/media") => {
  if (!file?.path) {
    throw new ApiError(400, "File path is required for upload");
  }

  ensureCloudinaryConfig();

  try {
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: inferResourceType(file.mimetype),
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      resourceType: uploadResult.resource_type,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      originalName: file.originalname,
    };
  } catch (error) {
    throw new ApiError(500, error.message || "Cloudinary upload failed");
  } finally {
    try {
      await fs.unlink(path.resolve(file.path));
    } catch (_error) {
      // Ignore local cleanup failures to avoid hiding upload result/errors.
    }
  }
};

export default {
  uploadMediaService,
};
