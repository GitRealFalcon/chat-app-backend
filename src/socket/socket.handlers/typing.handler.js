import socketEvents from "../../constants/socket.events.js"
import { publshTypingStatus } from "../../redis/pubsub.js"

export default(io,socket) => {
    socket.on(socketEvents.TYPING_START, async (payload) => {
  await publshTypingStatus({
    type: socketEvents.TYPING_START,
    ...payload
  })
})

socket.on(socketEvents.TYPING_STOP, async (payload) => {
  await publshTypingStatus({
    type: socketEvents.TYPING_STOP,
    ...payload
  })
})

}