import { Queue } from "bullmq";
import bullMqConnection from "../config/bullMq.js";

export const MESSAGE_QUEUE = "message-queue";

export const messageQueue = new Queue(MESSAGE_QUEUE, {
  connection: bullMqConnection,
  defaultJobOptions:{
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  }
});