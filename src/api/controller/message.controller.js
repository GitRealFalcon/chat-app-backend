import ApiResponse from "../../utils/ApiRespose.js";
import messageService from "../service/message.service.js";
import asyncHandler from "../../utils/asyncHandler.js";

const getDirectMessages = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    const {peerId} = req.params;
    const page = parseInt(req.query.page) || 1;
    const messages = await messageService.getDirectMessages(userId,peerId, page);
    res.status(200).json(new ApiResponse(200,"Direct messages fetched successfully",messages));
})

const getGroupMessages = asyncHandler(async (req, res) => {
    const {groupId} = req.params;
    const page = parseInt(req.query.page) || 1;
    const messages = await messageService.getGroupMessages(groupId, page);
    res.status(200).json(new ApiResponse(200,"Group messages fetched successfully",messages));
})

const updateMessageStatus = asyncHandler(async(req, res)=>{
    const userId = req.user?._id
    const {peerId} = req.params
    await messageService.updateMessageStatusService(peerId,userId)
    res.status(200)
    .json(new ApiResponse(200,"Message status update success"))
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
    getDirectMessages,
    getGroupMessages,
    updateMessageStatus,
    deleteOne,
    deleteAll
}