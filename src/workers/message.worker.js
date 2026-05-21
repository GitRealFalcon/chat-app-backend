import { Worker } from "bullmq";
import mongoose from "mongoose";
import { Message } from "../models/message.model.js";
import { GroupMessage } from "../models/groupMessage.model.js";
import { MESSAGE_QUEUE } from "../queues/message.queue.js";
import {bullMqConnection} from "../config/bullMq.js";
import DBConnect from "../config/mongo.js";

const startWorker = async () => {
  try {
    await DBConnect();

    const worker = new Worker(
      MESSAGE_QUEUE,
      async (job) => {
        const {
          type,
          sender,
          text,
          receiver,
          group,
          ts,
          msgId,
          clientMsgId,
          conversationId,
        } = job.data;

        if (type === "direct") {
          return await Message.create({
            sender,
            receiver,
            conversationId,
            text,
            ts,
            msgId,
            clientMsgId,
          });
        }

        if (type === "group") {
          return await GroupMessage.create({
            sender,
            group,
            text,
            ts,
            msgId,
          });
        }

        throw new Error("Unknown message type");
      },
      { connection: bullMqConnection },
    );

    worker.on("completed", (job) =>
      console.log("✅ Job completed:", job.id),
    );

    worker.on("failed", (job, err) =>
      console.error("❌ Job failed:", job?.id, err),
    );

    worker.on("error", (err) => {
      console.error("❌ Worker error:", err);
    });
  } catch (error) {
    console.error("❌ Worker startup failed:", error);
    process.exit(1);
  }
};

startWorker();
