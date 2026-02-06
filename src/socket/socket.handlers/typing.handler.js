import socketEvents from "../../constants/socket.events.js"
import { publshTypingStatus } from "../../redis/pubsub.js"

export default(io,socket) => {
    socket.on(socketEvents.TYPING,async(payload)=>{
        await publshTypingStatus(payload)
    })
}