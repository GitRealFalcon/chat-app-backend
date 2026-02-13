import { Server } from "socket.io";
import {socketAuth} from "./socket.auth.js"
import { registerSocketEvents } from "./socket.event.js";
import { initRedisSubscriber } from "../redis/pubsub.js";


export const initSocket = (httpServer)=>{
    const io = new Server(httpServer,{
        cors:{
            origin:"*",
            methods:["GET","POST"],
            credentials:true,
        }
    })
   
    
    io.use(socketAuth)
    registerSocketEvents(io);
    initRedisSubscriber(io)

    return io;
}

export default initSocket;