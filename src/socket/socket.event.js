import connectHandler from "./socket.handlers/connect.handler.js";
import groupHandler from "./socket.handlers/group.handler.js";
import directHandler from "./socket.handlers/direct.handler.js";
import typingHandler from "./socket.handlers/typing.handler.js";

export const registerSocketEvents = (io) => {
        
    io.on("connection",(socket)=>{
        connectHandler(io,socket);
        directHandler(io,socket);
        groupHandler(io,socket);
        typingHandler(io,socket);  
    })



}