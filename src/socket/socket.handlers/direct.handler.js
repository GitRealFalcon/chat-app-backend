import socketEvents from "../../constants/socket.events.js"
import { publishDirectMessage } from "../../redis/pubsub.js"
export default (io,socket) => {
    socket.on(socketEvents.DIRECT_MESSAGE,async(payload)=>{
        await publishDirectMessage(payload)
    })
}