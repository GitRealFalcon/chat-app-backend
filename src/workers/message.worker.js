import { Worker } from "bullmq";
import { MESSAGE_QUEUE } from "../queues/message.queue";
import bullMqConnection from "../config/bullMq.js";
import { Message } from "../models/message.model.js";
import { GroupMessage } from "../models/groupMessage.model.js";

new Worker(
  MESSAGE_QUEUE,
  async (job) => {
    const { messageType, sender, content, receiver, group, createdAt } =
      job.data;
    if (messageType === "direct") {
      return await new Message.create({
        sender,
        receiver,
        content,
        createdAt,
      });
    }

    if (messageType === "group") {
      return await new GroupMessage.create({
        sender,
        group,
        content,
        createdAt,
      });
    }

    throw new Error("Unknown message type");
  },
  {
    connection: bullMqConnection,
  },
);
