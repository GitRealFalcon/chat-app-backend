import http from "http";
import app from "./app.js";
import initSocket from "./socket/index.js";
import DBConnect from "./config/mongo.js"

DBConnect()
const httpServer = http.createServer(app);
const io =initSocket(httpServer)

httpServer.listen(8000,()=>{
    console.log("✅ Server is running on port 8000");
})
