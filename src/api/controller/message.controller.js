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

export default{
    getDirectMessages,
    getGroupMessages
}