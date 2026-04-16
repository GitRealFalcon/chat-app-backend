import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiRespose.js";
import ApiError from "../../utils/ApiError.js";
import friendRequestService from "../service/friendRequest.service.js";


const friendRequest = asyncHandler(async (req, res) => {
  const reqId = req.params.reqId;
  const userId = req.user?._id;

  const response = await friendRequestService.requestService(reqId, userId);

  res.status(200)
  .json(new ApiResponse(200,"Friend request send"))
});

const acceptRequest = asyncHandler(async(req,res)=>{
  const reqId = req.params.reqId;
  const userId = req.user?._id;

  const response = await friendRequestService.acceptRequestService(reqId,userId)
  res.status(200)
  .json(new ApiResponse(200,"Friend request accepted"))
})

const rejectRequest = asyncHandler(async(req,res)=>{
  const reqId = req.params.reqId;
  const userId = req.user?._id;

  const response = await friendRequestService.rejectRequestService(reqId, userId)
  res.status(200)
  .json(new ApiResponse(200,"Friend request rejected"))
})
const cancelRequest = asyncHandler(async(req,res)=>{
  const reqId = req.params.reqId;
  const userId = req.user?._id;

  const response = await friendRequestService.cancelRequestService(reqId, userId)
  res.status(200)
  .json(new ApiResponse(200,"Friend request rejected"))
})

const getRequests = asyncHandler(async(req,res)=>{
  const userId = req.user._id

  const requests = await friendRequestService.getFriendRequestService(userId)
  res.status(200)
  .json(new ApiResponse(200,"Friend request get success",requests))
})

export default {
    acceptRequest,
    friendRequest,
    rejectRequest,
    getRequests,
    cancelRequest
}