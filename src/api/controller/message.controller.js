import ApiResponse from "../../utils/ApiRespose.js";
import messageService from "../service/message.service.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { publishMessageStatusUpdate } from "../../redis/pubsub.js";

const getGroupMessages = asyncHandler(async (req, res) => {
    const {groupId} = req.params;
    const page = parseInt(req.query.page) || 1;
    const messages = await messageService.getGroupMessages(groupId, page);
    res.status(200).json(new ApiResponse(200,"Group messages fetched successfully",messages));
})

const updateMessageStatusV2 = asyncHandler(async (req, res) => {
    const userId = String(req.user?._id)
    const { status, messageId, readUptoMessageId, conversationId } = req.body

    let payload

    if (status === "delivered") {
        payload = await messageService.markMessageDeliveredService({
            messageId,
            userId,
            conversationId,
        })
    }

    if (status === "read") {
        payload = await messageService.markMessageReadService({
            messageId,
            readUptoMessageId,
            userId,
            conversationId,
        })
    }

    if (payload) {
        await publishMessageStatusUpdate(payload)
    }

    res.status(200).json(new ApiResponse(200, "Message status update success", payload))
})

const deleteOne = asyncHandler(async(req,res)=>{
    const msgId = req.params?.msgId
    const result = await messageService.deleteOneService(msgId)

    res.status(200)
    .json(new ApiResponse(200,"Message delete success"))
})
const deleteAll = asyncHandler(async(req,res)=>{
    const chatId = req.params?.chatId
    const userId = req.user?._id
    const result = await messageService.deleteAllService(chatId,userId)

    res.status(200)
    .json(new ApiResponse(200,"Messages delete success"))
})

export default{
    getGroupMessages,
    updateMessageStatusV2,
    deleteOne,
    deleteAll
}