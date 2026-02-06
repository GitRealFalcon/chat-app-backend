import { Server } from "socket.io";
import {socketAuth} from "./socket.auth.js"


export const initSocket = (httpServer)=>{
    const io = new Server(httpServer,{
        cors:{
            origin:"*",
            methods:["GET","POST"],
            credentials:true,
        }
    })

    io.use(socketAuth)

    io.on("connection",(socket)=>{
        console.log(`✅ Socket connected : ${socket.id}`);


        socket.on("disconnect",(reson)=>{
            console.log(`❌ Socket disconnected : ${socket.id} | Reason : ${reson}`);
        })
        
    })

    return io;
}

export default initSocket;