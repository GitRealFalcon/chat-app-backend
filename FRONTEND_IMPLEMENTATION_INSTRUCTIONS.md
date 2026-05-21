# Frontend Implementation Instructions (Conversation-First Chat)

This guide explains how to integrate the current backend APIs and Socket.IO contracts in frontend apps.

## 1. Base Setup

1. Use cookie-based auth for API and Socket.IO requests.
2. Always send credentials in REST calls:
   - `fetch(..., { credentials: "include" })`
3. Socket connection should include cookies (same-site/cors setup must allow credentials).
4. Keep one normalized store for:
   - conversations
   - messages by conversationId
   - message status map

## 2. API Endpoints to Use

### Conversation APIs

1. Create/get direct conversation:
   - `POST /api/v1/conversation/direct`
   - Body:
```json
{
  "participantId": "<userId>"
}
```

2. Get chat list with cursor pagination:
   - `GET /api/v1/conversation?cursor=<cursor>&limit=20`

3. Get messages by conversation:
   - `GET /api/v1/conversation/:conversationId/messages?cursor=<cursor>&limit=30`

### Message Status API

1. Update delivery/read status:
   - `PATCH /api/v1/message/status`

2. Delivered payload:
```json
{
  "status": "delivered",
  "messageId": "<messageId>",
  "conversationId": "<conversationId>"
}
```

3. Read payload (single):
```json
{
  "status": "read",
  "messageId": "<messageId>",
  "conversationId": "<conversationId>"
}
```

4. Read payload (range):
```json
{
  "status": "read",
  "readUptoMessageId": "<messageId>",
  "conversationId": "<conversationId>"
}
```

### Media Upload APIs

1. Single file:
   - `POST /api/v1/media/single`
   - multipart field: `file`

2. Multiple files:
   - `POST /api/v1/media/multiple`
   - multipart field: `files`

3. Backend constraints:
   - max file size: 50MB
   - multiple upload max count: 5
   - allowed types: image/video/document/text-like mime types

## 3. Socket Events (Required)

### Client -> Server

1. `message:send`
```json
{
  "conversationId": "<conversationId>",
  "text": "Hello",
  "clientMsgId": "<uuid-or-temp-id>"
}
```

2. `message:delivered`
```json
{
  "messageId": "<messageId>",
  "conversationId": "<conversationId>"
}
```

3. `message:read`
```json
{
  "readUptoMessageId": "<messageId>",
  "conversationId": "<conversationId>"
}
```

4. `typing:start`
```json
{
  "chatType": "direct",
  "chatId": "<peerId-or-conversation-context-id>",
  "userId": "<currentUserId>"
}
```

5. `typing:stop`
```json
{
  "chatType": "direct",
  "chatId": "<peerId-or-conversation-context-id>",
  "userId": "<currentUserId>"
}
```

### Server -> Client

1. `message:sent` (sender ack)
2. `message:new` (recipient new message)
3. `message:status:update` (delivered/read transitions)
4. `conversation:update` (chat list item refresh)

Legacy aliases may still be emitted in some paths (`direct:message`, `group:message`), but new frontend code should use conversation-first events above.

## 4. Optimistic UI Flow (Recommended)

1. On send click:
   - create local pending message with `clientMsgId`
   - status: `sending`
   - render immediately

2. Emit `message:send`.

3. On `message:sent`:
   - reconcile by `clientMsgId`
   - replace temp id with server id
   - set status to `sent`

4. On `message:status:update`:
   - update message status to `delivered` or `read`

5. On socket error/timeout:
   - set local status to `failed`
   - allow retry using same content with new `clientMsgId`

## 5. Read/Delivered Triggers

1. Delivered:
   - emit once message is received and rendered in active view.

2. Read:
   - when conversation becomes active and messages are visible,
   - emit read using `readUptoMessageId` (last visible incoming message).

## 6. Pagination Rules

1. Use backend cursor fields exactly as returned (`nextCursor`).
2. Stop when `hasMore === false`.
3. Prepend older messages when loading history.
4. Deduplicate by message `_id` or `clientMsgId`.

## 7. Error Handling Expectations

1. `401` on protected routes: trigger auth refresh flow or redirect to login.
2. `400` on validation errors: show inline input/message error.
3. Media upload errors:
   - `LIMIT_FILE_SIZE`
   - `LIMIT_UNEXPECTED_FILE`
   - unsupported mime type message

## 8. Frontend Checklist

1. Replace old peer-based fetches with conversation-based routes.
2. Ensure conversationId is stored and used for all message operations.
3. Implement socket event handlers for the four server events.
4. Implement optimistic send and reconciliation by clientMsgId.
5. Wire delivered/read emissions on lifecycle events.
6. Add retry UX for failed optimistic messages.
7. Enforce media type and size checks client-side before upload.
8. Add integration tests for chat list, conversation messages, send flow, and status transitions.

## 9. Quick Example (REST + Socket Sequence)

1. `POST /conversation/direct` with participantId -> get conversationId
2. `GET /conversation/:id/messages` -> initial history
3. connect socket
4. emit `message:send` with conversationId + clientMsgId
5. receive `message:sent` -> reconcile optimistic item
6. recipient receives `message:new` -> renders and emits delivered
7. sender receives `message:status:update` -> delivered
8. recipient opens chat and emits read -> sender receives read update

---

If frontend needs a typed contract file next, create shared TypeScript interfaces for:
- ConversationListItem
- ConversationMessage
- MessageStatusUpdateEvent
- MessageSendPayload
- MessageReadPayload
- UploadResponse
