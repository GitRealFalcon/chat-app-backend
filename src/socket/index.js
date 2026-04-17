import { Server } from "socket.io";
import { socketAuth } from "./socket.auth.js";
import { registerSocketEvents } from "./socket.event.js";
import { initRedisSubscriber } from "../redis/pubsub.js";

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5174 ",
        "http://localhost:5173",
        "https://chat-application-frontend-woad.vercel.app",
        "https://chat.realfalcon.in",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 60000,
    transports: ["websocket", "polling"],
  });

  io.use(socketAuth);
  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.user?._id);

    socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected:", reason);
    });
  });

  io.on("connection_error", (err) => {
    console.log("❌ Connection error:", err.message);
  });
  registerSocketEvents(io);
  initRedisSubscriber(io);

  return io;
};

export default initSocket;
