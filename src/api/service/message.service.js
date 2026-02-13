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
    const {sender , receiver, text, type,ts} = payload;

    if(!text.trim()){
        throw new Error("Message content cannot be empty");
    }

    const message = {
        sender,
        receiver,
        text,
        type,
        ts
    }

   const job = await messageQueue.add("presis-message", message)
   
    return message;
}

const saveGroupMessage = async (payload) => {
    const {sender, group, text, type,ts} = payload;

    if(!text.trim()){
        throw new Error("Message content cannot be empty");
    }

    const message = {
        type,
        sender,
        group,
        text,
        ts
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



