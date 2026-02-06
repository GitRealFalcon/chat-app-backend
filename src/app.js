import express from "express";
import http from "http";
import {Server} from "socket.io"
import bodyparser from "body-parser";
import coockeeParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true,limit:"30mb"}));
app.use(bodyparser.json({limit:"30mb",extended:true}));
app.use(coockeeParser());
app.use(express.static("public"));


const httpServer = http.createServer(app);
const io = new Server(httpServer,{
    cors:{
        origin: "*"
    }
});

export {app,io,httpServer};