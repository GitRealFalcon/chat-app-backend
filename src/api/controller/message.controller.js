import ApiResponse from "../../utils/ApiRespose";
import messageService from "../services/message.service";
import asyncHandler from "../../utils/asyncHandler";

const getDirectMessages = asyncHandler(async (req, res) => {
    const {userId} = req.params;
    const page = parseInt(req.query.page) || 1;
    const messages = await messageService.getDirectMessages(userId, page);
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