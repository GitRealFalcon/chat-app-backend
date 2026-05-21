import test from "node:test";
import assert from "node:assert/strict";
import socketEvents from "../src/constants/socket.events.js";

test("socket event constants include required conversation-first lifecycle events", () => {
  const requiredKeys = [
    "MESSAGE_SEND",
    "MESSAGE_NEW",
    "MESSAGE_SENT",
    "MESSAGE_DELIVERED",
    "MESSAGE_READ",
    "MESSAGE_STATUS_UPDATE",
    "CONVERSATION_UPDATE",
    "TYPING_START",
    "TYPING_STOP",
  ];

  for (const key of requiredKeys) {
    assert.equal(typeof socketEvents[key], "string", `${key} must be defined`);
    assert.equal(socketEvents[key].length > 0, true, `${key} must not be empty`);
  }
});

test("socket event constants preserve backward compatibility aliases", () => {
  assert.equal(socketEvents.DIRECT_MESSAGE, "direct:message");
  assert.equal(socketEvents.GROUP_MESSAGE, "group:message");
});
