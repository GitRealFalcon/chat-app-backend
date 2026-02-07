import {Message} from "../../models/message.model.js";
import {GroupMessage} from "../../models/groupMessage.model.js"
import { redisClient } from "../../config/redis.js";
import {messageQueue} from "../../queues/message.queue.js";

const PAZE_SIZE = 20 ;
const getDirectMessages = async (userId, peerId, page = 1) => {
    const skip = (page - 1) * PAZE_SIZE;

    const messages = await Message.find({
        $or:[
            {sender: userId, receiver: peerId},
            {sender: peerId, receiver: userId}
        ],
        
    }).sort({ createdAt: -1 })
    .skip(skip)
    .limit(PAZE_SIZE)
    .lean();

    return messages;
}

const getGroupMessages = async (groupId, page = 1) => {
    const skip = (page -1) * PAZE_SIZE;

    const messages = await GroupMessage.find({group: groupId})
    .sort({createdAt: -1})
    .skip(skip)
    .limit(PAZE_SIZE)
    .lean();

    return messages;
}

const saveDirectMessage = async (payload)=>{
    const {senderId , receiverId, content, type,createdAt} = payload;

    if(!content.trim()){
        throw new Error("Message content cannot be empty");
    }

    const message = {
        messageType: type,
        sender: senderId,
        receiver: receiverId,
        content,
        createdAt
    }

    await messageQueue.add("presis-message", message)

    return message;
}

const saveGroupMessage = async (payload) => {
    const {senderId, groupId, content, type,createdAt} = payload;

    if(!content.trim()){
        throw new Error("Message content cannot be empty");
    }

    const message = {
        messageType: type,
        sender: senderId,
        group: groupId,
        content,
        createdAt
    }

    await messageQueue.add("presis-message", message)

    return message;
}

export default {
    getDirectMessages,
    getGroupMessages,
    saveDirectMessage,
    saveGroupMessage
}



