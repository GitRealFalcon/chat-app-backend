import socketEvents from "../../constants/socket.events.js"
import { publishDirectMessage } from "../../redis/pubsub.js"
export default (io,socket) => {
    socket.on(socketEvents.DIRECT_MESSAGE,async(payload)=>{

        const message = {
    msgId: payload.msgId,
    sender: payload.sender,
    receiver: payload.receiver,  // 🔥 VERY IMPORTANT
    text: payload.text,
    type: "direct",
    ts: payload.ts
  }
        await publishDirectMessage(message)
    })
}