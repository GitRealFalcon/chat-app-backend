import http from "http";
import app from "./app.js";
import initSocket from "./socket/index.js";


const httpServer = http.createServer(app);
initSocket(httpServer)

httpServer.listen(8000,()=>{
    console.log("✅ Server is running on port 8000");
})
