import { Group } from "../../models/group.model.js";
import { User } from "../../models/user.model.js";
import ApiError from "../../utils/ApiError.js";
import mongoose from "mongoose";

const createGroup = async (name, memberIds, adminIds,createdAt) => {
  const existingGroup = await Group.findOne({ name });
  if (existingGroup) {
    throw new ApiError(400, "Group already exists");
  }

  const newGroup = new Group({
    name,
    members: memberIds,
    admins: adminIds,
    createdAt
  });
  await newGroup.save();
  return newGroup;
};

const getGroupById = async (groupIds) => {

  const validGroupIds = groupIds.map(id => new mongoose.Types.ObjectId(id))
 
  const group = await Group.aggregate([
    {
       $match:{ 
        _id:{
          $in: validGroupIds
         }
        }
       },
    {
      $lookup: {
        from: "users",
        localField: "members",
        foreignField: "_id",
        as: "memberDetails",
        pipeline: [
          {
            $unset: ["password", "refreshToken"],
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "admins",
        foreignField: "_id",
        as: "adminDetails",
        pipeline: [
          {
            $unset: ["password", "refreshToken"],
          },
        ],
      },
    },
    { $project:{
        name:1,
        memberDetails:1,
        adminDetails:1,
    }}
  ]);

    if (!group || group.length === 0) {
        throw new ApiError(404, "Group not found");
    }

    return group[0];
};

const addMembersToGroup = async (groupId, memberIds)=>{
    const group = await Group.findById(groupId);
    if(!group){
        throw new ApiError(404,"Group not found");
    }
 
    group.members.push(...memberIds);
    await group.save();
   await User.updateMany(
    {_id:{$in:memberIds}},
    {$addToSet:{joinedGroup:groupId}}
   )
    return group;
}

const removeMembersFromGroup = async (groupId, memberIds)=>{
    const group = await Group.findById(groupId);
    if(!group){
        throw new ApiError(404,"Group not found");
    }
    group.members = group.members.filter(memberId => !memberIds.includes(memberId.toString()))
    await group.save();
    return group;
}

const isMemberOfGroup = async (groupId, userId) => {
    
    const group = await Group.findById(groupId);
    if(!group){
        throw new ApiError(404,"Group not found");
    }
    return group.members.includes(userId);
}

export default{
  createGroup,
  getGroupById,
  addMembersToGroup,
  removeMembersFromGroup,
  isMemberOfGroup
};
