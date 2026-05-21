import http from "http";
import app from "./app.js";
import initSocket from "./socket/index.js";
import DBConnect from "./config/mongo.js"
import { connectRedis } from "./config/redis.js";

const printMigrationWarnings = () => {
    console.log("✅ Conversation-first messaging mode is active.");
};

const startServer = async () => {
    try {
        await Promise.all([connectRedis(), DBConnect()]);

        const httpServer = http.createServer(app);
        initSocket(httpServer);

        const port = Number(process.env.PORT) || 8000;
        printMigrationWarnings();

        httpServer.listen(port, () => {
            console.log(`✅ Server is running on port ${port}`);
        });
    } catch (error) {
        console.error("❌ Server startup failed:", error);
        process.exit(1);
    }
};

startServer();
