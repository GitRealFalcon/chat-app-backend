import { Group } from "../../models/group.model.js";
import ApiError from "../../utils/ApiError.js";

const creatGroup = async (name, memberIds, adminIds) => {
  const existingGroup = await Group.findOne({ name });
  if (existingGroup) {
    throw new ApiError(400, "Group already exists");
  }

  const newGroup = new Group({
    name,
    members: memberIds,
    admins: adminIds,
    createdAt: Date.now(),
  });
  await newGroup.save();
  return newGroup;
};

const getGroupById = async (groupId) => {
  const group = await Group.aggregate([
    { $match: { _id: groupId } },
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
        membersDetails:1,
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
  creatGroup,
  getGroupById,
  addMembersToGroup,
  removeMembersFromGroup,
  isMemberOfGroup
};
