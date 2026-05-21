import mongoose from "mongoose";
import DBConnect from "../config/mongo.js";
import { Message } from "../models/message.model.js";
import { createOrGetDirectConversation } from "../api/service/conversation.service.js";

const pipeline = [
  {
    $match: {
      sender: { $exists: true, $ne: null },
      receiver: { $exists: true, $ne: null },
      $or: [{ conversationId: { $exists: false } }, { conversationId: null }],
    },
  },
  {
    $project: {
      sender: 1,
      receiver: 1,
      senderStr: { $toString: "$sender" },
      receiverStr: { $toString: "$receiver" },
    },
  },
  {
    $project: {
      userA: {
        $cond: [{ $lt: ["$senderStr", "$receiverStr"] }, "$sender", "$receiver"],
      },
      userB: {
        $cond: [{ $lt: ["$senderStr", "$receiverStr"] }, "$receiver", "$sender"],
      },
    },
  },
  {
    $group: {
      _id: {
        userA: "$userA",
        userB: "$userB",
      },
    },
  },
];

const backfillConversationIds = async () => {
  await DBConnect();

  let processedPairs = 0;
  let updatedMessages = 0;

  const pairs = await Message.aggregate(pipeline);

  for (const pair of pairs) {
    const userA = pair?._id?.userA;
    const userB = pair?._id?.userB;

    if (!userA || !userB) {
      continue;
    }

    const { conversation } = await createOrGetDirectConversation(userA, userB);

    const result = await Message.updateMany(
      {
        $and: [
          {
            $or: [
              { sender: userA, receiver: userB },
              { sender: userB, receiver: userA },
            ],
          },
          {
            $or: [{ conversationId: { $exists: false } }, { conversationId: null }],
          },
        ],
      },
      {
        $set: {
          conversationId: conversation._id,
        },
      },
    );

    processedPairs += 1;
    updatedMessages += result.modifiedCount || 0;

    if (processedPairs % 100 === 0) {
      console.log(
        `Processed pairs: ${processedPairs}/${pairs.length}, updated messages: ${updatedMessages}`,
      );
    }
  }

  console.log("Backfill complete", {
    processedPairs,
    updatedMessages,
  });
};

backfillConversationIds()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Backfill failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  });
