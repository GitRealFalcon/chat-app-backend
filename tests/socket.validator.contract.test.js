import test from "node:test";
import assert from "node:assert/strict";
import {
  validateSendPayload,
  validateStatusPayload,
} from "../src/socket/validators/messageSocket.validator.js";

test("validateSendPayload rejects invalid payloads", () => {
  assert.match(validateSendPayload(null), /invalid payload/i);
  assert.match(validateSendPayload({}), /receiver or conversationId is required/i);
  assert.match(
    validateSendPayload({ conversationId: "6655f2bf8a7f5f3f8f08af51" }),
    /text is required/i,
  );
});

test("validateSendPayload accepts receiver-based and conversation-based payloads", () => {
  assert.equal(
    validateSendPayload({ receiver: "6655e8f4f89d2b3a7e8ac102", text: "hello" }),
    null,
  );

  assert.equal(
    validateSendPayload({
      conversationId: "6655f2bf8a7f5f3f8f08af51",
      text: "hello",
    }),
    null,
  );
});

test("validateStatusPayload rejects invalid payloads", () => {
  assert.match(validateStatusPayload(null), /invalid payload/i);
  assert.match(validateStatusPayload({}), /messageId or readUptoMessageId is required/i);
});

test("validateStatusPayload accepts delivered/read payload variants", () => {
  assert.equal(validateStatusPayload({ messageId: "6656034cc8b62ef9fc6bcb5f" }), null);
  assert.equal(
    validateStatusPayload({ readUptoMessageId: "6656034cc8b62ef9fc6bcb5f" }),
    null,
  );
});
