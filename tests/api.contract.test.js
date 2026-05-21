import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import express from "express";
import conversationRoutes from "../src/api/routes/conversation.routes.js";

const workspaceRoot = path.resolve(process.cwd());
const messageRoutesPath = path.join(
  workspaceRoot,
  "src",
  "api",
  "routes",
  "message.routes.js",
);

test("legacy direct message route is removed from message routes", async () => {
  const content = await fs.readFile(messageRoutesPath, "utf8");
  assert.equal(content.includes('"/direct/:peerId"'), false);
});

test("legacy peer status update route is removed from message routes", async () => {
  const content = await fs.readFile(messageRoutesPath, "utf8");
  assert.equal(content.includes('"/update/:peerId"'), false);
});

test("conversation routes require authentication", async () => {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/conversation", conversationRoutes);
  app.use((err, _req, res, _next) => {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to resolve server address");
  }

  const baseUrl = `http://127.0.0.1:${address.port}`;

  const [listResponse, messagesResponse, createResponse] = await Promise.all([
    fetch(`${baseUrl}/api/v1/conversation`),
    fetch(`${baseUrl}/api/v1/conversation/6655f2bf8a7f5f3f8f08af51/messages`),
    fetch(`${baseUrl}/api/v1/conversation/direct`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ participantId: "6655e8f4f89d2b3a7e8ac102" }),
    }),
  ]);

  assert.equal(listResponse.status, 401);
  assert.equal(messagesResponse.status, 401);
  assert.equal(createResponse.status, 401);

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
});
