import ApiResponse from "../../utils/ApiRespose.js";
import asyncHandler from "../../utils/asyncHandler.js";
import conversationService from "../service/conversation.service.js";

const createDirectConversation = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { participantId } = req.body;

  const result = await conversationService.createDirectConversationService(
    participantId,
    userId,
  );

  res
    .status(result.created ? 201 : 200)
    .json(
      new ApiResponse(
        result.created ? 201 : 200,
        result.created ? "Conversation created" : "Conversation fetched",
        {
          created: result.created,
          conversation: result.conversation,
        },
      ),
    );
});

const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { cursor, limit } = req.query;

  const result = await conversationService.getConversationsService(
    userId,
    cursor,
    limit,
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Conversations fetched", result));
});

const getConversationMessages = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { conversationId } = req.params;
  const { cursor, limit } = req.query;

  const result = await conversationService.getConversationMessagesService(
    conversationId,
    userId,
    cursor,
    limit,
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Conversation messages fetched", result));
});

export default {
  createDirectConversation,
  getConversations,
  getConversationMessages,
};
