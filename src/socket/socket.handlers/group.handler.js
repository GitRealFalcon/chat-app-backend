import socketEvents from "../../constants/socket.events.js"
import { publishGroupMessage } from "../../redis/pubsub.js"
export default (io,socket) => {
    socket.on(socketEvents.GROUP_MESSAGE,async(payload)=>{
        await publishGroupMessage(payload)
    })
}