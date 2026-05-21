import ApiError from "../../utils/ApiError.js";

export const validateMessageStatusBody = (req, _res, next) => {
  const { status, messageId, readUptoMessageId, conversationId } = req.body || {};

  if (status !== "delivered" && status !== "read") {
    return next(new ApiError(400, "status must be either delivered or read"));
  }

  if (
    status === "delivered" &&
    (typeof messageId !== "string" || messageId.trim().length === 0)
  ) {
    return next(new ApiError(400, "messageId is required for delivered status"));
  }

  if (
    status === "read" &&
    (!messageId || typeof messageId !== "string") &&
    (!readUptoMessageId || typeof readUptoMessageId !== "string")
  ) {
    return next(new ApiError(400, "messageId or readUptoMessageId is required for read status"));
  }

  if (conversationId !== undefined && typeof conversationId !== "string") {
    return next(new ApiError(400, "conversationId must be a string"));
  }

  return next();
};
