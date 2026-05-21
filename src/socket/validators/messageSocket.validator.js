const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const validateSendPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return "Invalid payload";
  }

  if (!isNonEmptyString(payload.receiver) && !isNonEmptyString(payload.conversationId)) {
    return "receiver or conversationId is required";
  }

  if (!isNonEmptyString(payload.text)) {
    return "text is required";
  }

  return null;
};

export const validateStatusPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return "Invalid payload";
  }

  if (!isNonEmptyString(payload.messageId) && !isNonEmptyString(payload.readUptoMessageId)) {
    return "messageId or readUptoMessageId is required";
  }

  return null;
};

export const hasNonEmptyString = isNonEmptyString;
