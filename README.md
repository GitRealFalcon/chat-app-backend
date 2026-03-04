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

