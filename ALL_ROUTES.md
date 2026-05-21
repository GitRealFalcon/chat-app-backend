# All Backend Routes

Base prefix: `/api/v1`

## Auth Routes (`/auth`)

| Method | Full Path | Auth Required | Handler |
|---|---|---|---|
| POST | `/api/v1/auth/register` | No | `authController.register` |
| POST | `/api/v1/auth/login` | No | `authController.login` |
| POST | `/api/v1/auth/logout` | Yes | `authController.logout` |
| GET | `/api/v1/auth/me` | Yes | `authController.Me` |
| POST | `/api/v1/auth/refresh` | No | `authController.refreshToken` |
| POST | `/api/v1/auth/verification` | No | `authController.verification` |
| PATCH | `/api/v1/auth/generate/:email` | No | `authController.generateVerificationCode` |

## Conversation Routes (`/conversation`)

| Method | Full Path | Auth Required | Middleware | Handler |
|---|---|---|---|---|
| GET | `/api/v1/conversation` | Yes | `validateCursorPagination` | `conversationController.getConversations` |
| GET | `/api/v1/conversation/:conversationId/messages` | Yes | `validateCursorPagination` | `conversationController.getConversationMessages` |
| POST | `/api/v1/conversation/direct` | Yes | `validateCreateDirectConversation` | `conversationController.createDirectConversation` |

## Friend Request Routes (`/request`)

| Method | Full Path | Auth Required | Handler |
|---|---|---|---|
| POST | `/api/v1/request/sent/:reqId` | Yes | `friendRequestController.friendRequest` |
| GET | `/api/v1/request/get` | Yes | `friendRequestController.getRequests` |
| PATCH | `/api/v1/request/accept/:reqId` | Yes | `friendRequestController.acceptRequest` |
| PATCH | `/api/v1/request/reject/:reqId` | Yes | `friendRequestController.rejectRequest` |
| PATCH | `/api/v1/request/cancel/:reqId` | Yes | `friendRequestController.cancelRequest` |

## Group Routes (`/group`)

| Method | Full Path | Auth Required | Handler |
|---|---|---|---|
| POST | `/api/v1/group` | Yes | `groupController.createGroup` |
| GET | `/api/v1/group/:groupId` | Yes | `groupController.getGroupById` |
| POST | `/api/v1/group/:groupId/members` | Yes | `groupController.addMembersToGroup` |
| DELETE | `/api/v1/group/:groupId/members` | Yes | `groupController.removeMembersFromGroup` |
| GET | `/api/v1/group/:groupId/isMember` | Yes | `groupController.isMemberOfGroup` |

## Message Routes (`/message`)

| Method | Full Path | Auth Required | Middleware | Handler |
|---|---|---|---|---|
| GET | `/api/v1/message/group/:groupId` | Yes | - | `messageController.getGroupMessages` |
| PATCH | `/api/v1/message/status` | Yes | `validateMessageStatusBody` | `messageController.updateMessageStatusV2` |
| DELETE | `/api/v1/message/one/:msgId` | Yes | - | `messageController.deleteOne` |
| DELETE | `/api/v1/message/all/:chatId` | Yes | - | `messageController.deleteAll` |

## Media Routes (`/media`)

| Method | Full Path | Auth Required | Middleware | Handler |
|---|---|---|---|---|
| POST | `/api/v1/media/single` | Yes | `uploadSingle("file")` | `uploadMediaController.uploadMedia` |
| POST | `/api/v1/media/multiple` | Yes | `uploadArray("files", 5)` | `uploadMediaController.uploadMultipleMedia` |

## User Routes (`/user`)

| Method | Full Path | Auth Required | Handler |
|---|---|---|---|
| GET | `/api/v1/user/:userId/user` | Yes | `userController.getUserById` |
| GET | `/api/v1/user/search` | Yes | `userController.searchUsersByName` |
| GET | `/api/v1/user/onlineUser` | Yes | `userController.getOnlineUsers` |
| PATCH | `/api/v1/user/block/:chatId` | Yes | `userController.blockContact` |
| PATCH | `/api/v1/user/unblock/:chatId` | Yes | `userController.unBlockContact` |

---

## Notes

1. All routes marked Auth Required use `authMiddleware`.
2. Conversation-first APIs are active for direct chat history and message flow.
3. Legacy peer-based direct message endpoints are removed.

---

## Response Model

### Success Response Envelope

Most controllers return the shared `ApiResponse` format:

```json
{
  "statuscode": 200,
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Field meanings:

1. `statuscode`: mirrors HTTP status code.
2. `success`: `true` when `statuscode < 400`.
3. `message`: human-readable result message.
4. `data`: payload body (object, array, or primitive depending on route).

### Error Response Envelope

Global error middleware returns:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Module Payload Shapes (data)

These are the primary `data` payload patterns used by current routes.

1. Auth (`/auth`)
	- Register/Login/Me: user profile object (and tokens where controller includes them)
	- Refresh: refreshed access token payload

2. Conversation (`/conversation`)
	- `GET /conversation`: 
```json
{
  "items": [],
  "hasMore": false,
  "nextCursor": null
}
```
	- `GET /conversation/:conversationId/messages`:
```json
{
  "conversationId": "<id>",
  "items": [],
  "hasMore": false,
  "nextCursor": null
}
```
	- `POST /conversation/direct`:
```json
{
  "created": true,
  "conversation": {}
}
```

3. Message (`/message`)
	- `GET /group/:groupId`: array of group messages
	- `PATCH /status`: status update payload
```json
{
  "messageId": "<id>",
  "readUptoMessageId": "<id>",
  "conversationId": "<id>",
  "status": "delivered|read",
  "updatedAt": "<iso-date>"
}
```
	- delete routes: success summary object (for example delete count or success flag)

4. Media (`/media`)
	- `/single`: uploaded media object
```json
{
  "url": "<https-url>",
  "publicId": "<cloudinary-id>",
  "resourceType": "image|video|raw",
  "format": "jpg|png|...",
  "bytes": 1234,
  "originalName": "file.jpg"
}
```
	- `/multiple`: array of uploaded media objects

5. User / Group / Request modules
	- Return either object payloads or arrays, wrapped in the same success envelope.

### Frontend Handling Rules

1. Always read `success` first for flow control.
2. Use `message` for toast/error text.
3. Consume route-specific values from `data`.
4. Do not assume `data` is always an object; some routes return arrays.
