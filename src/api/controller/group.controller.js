import ApiError from "../../utils/ApiError.js";
import groupService from "../service/group.service.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiRespose.js";

const createGroup = asyncHandler(async (req,res)=>{
    const {name, memberIds, adminIds} = req.body;
    if(!name || !memberIds || !adminIds){
        throw new ApiError(400,"Name, memberIds and adminIds are required");
    }
    const group = await groupService.createGroup(name, memberIds, adminIds);
    res.status(201).json(new ApiResponse(201,"Group created successfully",group));
})

const getGroupById = asyncHandler(async (req,res)=>{
    const {groupId} = req.body;    
    const group = await groupService.getGroupById(groupId);
    res.status(200).json(new ApiResponse(200,"Group fetched successfully",group));
})

const addMembersToGroup = asyncHandler(async (req,res)=>{
    const {groupId} = req.params;
    const {memberIds} = req.body;
    if(!memberIds){
        throw new ApiError(400,"memberIds are required");
    }
    const group = await groupService.addMembersToGroup(groupId, memberIds);
    res.status(200).json(new ApiResponse(200,"Members added successfully",group));
})

const removeMembersFromGroup = asyncHandler(async (req,res)=>{
    const {groupId} = req.params;
    const {memberIds} = req.body;
    if(!memberIds){
        throw new ApiError(400,"memberIds are required");
    }
    const group = await groupService.removeMembersFromGroup(groupId, memberIds);
    res.status(200).json(new ApiResponse(200,"Members removed successfully",group));
})

const isMemberOfGroup = asyncHandler(async (req,res)=>{
    const {groupId} = req.params;
    const {userId} = req.body;
    if(!userId){
        throw new ApiError(400,"userId is required");
    }
    const isMember = await groupService.isMemberOfGroup(groupId, userId);
    res.status(200).json(new ApiResponse(200,"Membership status fetched successfully",{isMember}));
})

export default{
    createGroup,
    getGroupById,
    addMembersToGroup,
    removeMembersFromGroup,
    isMemberOfGroup
};