import ApiError from "../../utils/ApiError.js";

export const validateCreateDirectConversation = (req, _res, next) => {
  const { participantId } = req.body || {};

  if (typeof participantId !== "string" || participantId.trim().length === 0) {
    return next(new ApiError(400, "participantId is required"));
  }

  req.body.participantId = participantId.trim();
  return next();
};

export const validateCursorPagination = (req, _res, next) => {
  const { limit, cursor } = req.query;

  if (limit !== undefined) {
    const parsedLimit = Number(limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      return next(new ApiError(400, "limit must be an integer between 1 and 50"));
    }
  }

  if (cursor !== undefined && (typeof cursor !== "string" || cursor.trim().length === 0)) {
    return next(new ApiError(400, "cursor must be a non-empty string"));
  }

  return next();
};
