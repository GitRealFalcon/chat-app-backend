import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import express from "express";
import conversationController from "../src/api/controller/conversation.controller.js";
import {
  validateCreateDirectConversation,
  validateCursorPagination,
} from "../src/api/validators/conversation.validator.js";
import conversationService from "../src/api/service/conversation.service.js";

const originalConversationMethods = {
  createDirectConversationService: conversationService.createDirectConversationService,
  getConversationsService: conversationService.getConversationsService,
  getConversationMessagesService: conversationService.getConversationMessagesService,
};

const fakeAuth = (req, _res, next) => {
  req.user = { _id: "6655e8f4f89d2b3a7e8ac999" };
  next();
};

const app = express();
app.use(express.json());

app.get(
  "/api/v1/conversation",
  fakeAuth,
  validateCursorPagination,
  conversationController.getConversations,
);
app.get(
  "/api/v1/conversation/:conversationId/messages",
  fakeAuth,
  validateCursorPagination,
  conversationController.getConversationMessages,
);
app.post(
  "/api/v1/conversation/direct",
  fakeAuth,
  validateCreateDirectConversation,
  conversationController.createDirectConversation,
);

app.use((err, _req, res, _next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
  });
});

const server = http.createServer(app);

const getBaseUrl = () => {
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to resolve server address");
  }

  return `http://127.0.0.1:${address.port}`;
};

const request = async (path, options = {}) => {
  const url = `${getBaseUrl()}${path}`;

  return fetch(url, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
};

test.before(async () => {
  await new Promise((resolve) => server.listen(0, resolve));
});

test.after(async () => {
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

test.beforeEach(() => {
  conversationService.createDirectConversationService =
    originalConversationMethods.createDirectConversationService;
  conversationService.getConversationsService =
    originalConversationMethods.getConversationsService;
  conversationService.getConversationMessagesService =
    originalConversationMethods.getConversationMessagesService;
});

test("conversation list returns 200 with contract shape", async () => {
  conversationService.getConversationsService = async () => ({
    items: [
      {
        conversationId: "6655f2bf8a7f5f3f8f08af51",
        type: "direct",
        unreadCount: 0,
      },
    ],
    hasMore: false,
    nextCursor: null,
  });

  const response = await request("/api/v1/conversation?limit=20");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(Array.isArray(body.data.items), true);
  assert.equal(typeof body.data.hasMore, "boolean");
});

test("conversation messages returns 200 with contract shape", async () => {
  conversationService.getConversationMessagesService = async () => ({
    conversationId: "6655f2bf8a7f5f3f8f08af51",
    items: [
      {
        _id: "6656034cc8b62ef9fc6bcb5f",
        conversationId: "6655f2bf8a7f5f3f8f08af51",
        text: "Hello",
      },
    ],
    hasMore: false,
    nextCursor: null,
  });

  const response = await request(
    "/api/v1/conversation/6655f2bf8a7f5f3f8f08af51/messages?limit=30",
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(Array.isArray(body.data.items), true);
  assert.equal(body.data.conversationId, "6655f2bf8a7f5f3f8f08af51");
});

test("create direct conversation returns 201 when newly created", async () => {
  conversationService.createDirectConversationService = async () => ({
    created: true,
    conversation: {
      _id: "6655f2bf8a7f5f3f8f08af51",
      type: "direct",
    },
  });

  const response = await request("/api/v1/conversation/direct", {
    method: "POST",
    body: {
      participantId: "6655e8f4f89d2b3a7e8ac102",
    },
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.success, true);
  assert.equal(body.data.created, true);
  assert.equal(body.data.conversation.type, "direct");
});

test("create direct conversation validator rejects empty participantId", async () => {
  const response = await request("/api/v1/conversation/direct", {
    method: "POST",
    body: {
      participantId: "",
    },
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.match(body.message, /participantId is required/i);
});
