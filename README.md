# Chatting App Backend (V2)

A Node.js/Express backend for a real‑time chat application.  
This service exposes REST APIs and uses Socket.IO for live messaging.

---

## 🚀 Technology Stack

- **Node.js** (v18+)
- **Express** – web framework
- **MongoDB / Mongoose** – data storage
- **Redis** – pub/sub and caching
- **Socket.IO** – real‑time communication
- **BullMQ** – background jobs/queues
- **JWT** – authentication

---

## ✨ Key Features

- User registration/login with JWT
- Direct & group messaging
- Real‑time updates via WebSockets
- Typing indicators and online presence
- Message queuing & background processing
- Role-based route protection
- Centralized error handling
- Redis‑backed socket store and pub/sub channels

---

## Project Architecture Diagram
```
Client (React)
   ↓
REST API (Node.js + Express)
   ↓
MongoDB
   ↓
Redis Pub/Sub
   ↓
Socket.io real-time server
```
---

## 📁 Project Structure
```
├── src/
│ ├── api/
│ │ ├── controller/ – route handlers
│ │ ├── middleware/ – auth, error handling
│ │ ├── routes/ – express routers
│ │ └── service/ – business logic
│ ├── config/ – env, mongo, redis, BullMQ
│ ├── constants/ – channels, event names
│ ├── models/ – Mongoose schemas
│ ├── public/ – static assets (if any)
│ ├── queues/ – job definitions
│ ├── redis/ – pubsub, socket store
│ ├── socket/ – socket initialization & handlers
│ ├── utils/ – helpers, errors, JWT service
│ └── workers/ – background workers
├── package.json
└── README.md
```
---

## 🛠️ Available Scripts

```bash
# install dependencies
npm install

# start server in development (with nodemon)
npm run dev

# start production server
npm start

# backfill missing conversationId for old direct messages
npm run backfill:conversation-ids

# lint & fix files (if ESLint configured)
npm run lint

# run tests (not yet implemented)
npm test
```

---

## 🌐 Environment Variables

```bash
PORT=4000
MONGO_URI=mongodb://localhost:27017/chat
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret
```

The backend now uses conversation-first messaging APIs.
Use `/api/v1/conversation/:conversationId/messages` for direct message history.

---

## 🔁 API Migration Notes (Conversation-First)

Use this section when updating frontend/mobile clients from peer-based messaging APIs.

### Removed Endpoints

1. `GET /api/v1/message/direct/:peerId`
2. `PATCH /api/v1/message/update/:peerId`

### Replacements

1. Direct conversation bootstrap or fetch:
    - `POST /api/v1/conversation/direct`
2. Conversation chat list:
    - `GET /api/v1/conversation?cursor=<cursor>&limit=20`
3. Conversation message history:
    - `GET /api/v1/conversation/:conversationId/messages?cursor=<cursor>&limit=30`
4. Message delivered/read updates:
    - `PATCH /api/v1/message/status`

### Example Request/Response (Current Flow)

Create or get direct conversation:

```http
POST /api/v1/conversation/direct
Content-Type: application/json

{
   "participantId": "6655e8f4f89d2b3a7e8ac102"
}
```

```json
{
   "statuscode": 200,
   "success": true,
   "message": "Conversation fetched",
   "data": {
      "created": false,
      "conversation": {
         "_id": "6655f2bf8a7f5f3f8f08af51",
         "type": "direct",
         "participants": ["...", "..."],
         "lastMessageAt": "2026-04-20T11:04:12.000Z"
      }
   }
}
```

Fetch conversation messages:

```http
GET /api/v1/conversation/6655f2bf8a7f5f3f8f08af51/messages?limit=30
```

Mark message as delivered:

```http
PATCH /api/v1/message/status
Content-Type: application/json

{
   "status": "delivered",
   "messageId": "6656034cc8b62ef9fc6bcb5f",
   "conversationId": "6655f2bf8a7f5f3f8f08af51"
}
```

Mark messages as read (single or range):

```http
PATCH /api/v1/message/status
Content-Type: application/json

{
   "status": "read",
   "readUptoMessageId": "6656034cc8b62ef9fc6bcb5f",
   "conversationId": "6655f2bf8a7f5f3f8f08af51"
}
```

### Socket Event Alignment

Use these events in clients for real-time sync:

1. Client -> Server: `message:send`, `message:delivered`, `message:read`, `typing:start`, `typing:stop`
2. Server -> Client: `message:new`, `message:sent`, `message:status:update`, `conversation:update`

