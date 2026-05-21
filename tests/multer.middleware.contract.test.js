import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import express from "express";
import { uploadArray, uploadSingle } from "../src/api/middleware/multer.middleware.js";

const uploadsDir = path.resolve("public", "uploads");

const startServer = async (app) => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to resolve server address");
  }

  const baseUrl = `http://127.0.0.1:${address.port}`;

  const close = async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  };

  return { baseUrl, close };
};

const cleanupUploads = async () => {
  try {
    const files = await fs.readdir(uploadsDir);
    await Promise.all(
      files.map(async (name) => {
        const filePath = path.join(uploadsDir, name);
        await fs.unlink(filePath);
      }),
    );
  } catch (_error) {
    // Ignore cleanup errors in tests.
  }
};

test.afterEach(async () => {
  await cleanupUploads();
});

test("uploadSingle accepts allowed image mime type", async () => {
  const app = express();
  app.post("/single", uploadSingle("file"), (req, res) => {
    res.status(200).json({
      success: true,
      mimeType: req.file?.mimetype,
      originalName: req.file?.originalname,
    });
  });
  app.use((err, _req, res, _next) => {
    res.status(500).json({ success: false, message: err.message });
  });

  const { baseUrl, close } = await startServer(app);

  const form = new FormData();
  form.append("file", new Blob(["hello"], { type: "image/png" }), "photo.png");

  const response = await fetch(`${baseUrl}/single`, {
    method: "POST",
    body: form,
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.mimeType, "image/png");
  assert.equal(body.originalName, "photo.png");

  await close();
});

test("uploadSingle rejects disallowed mime type", async () => {
  const app = express();
  app.post("/single", uploadSingle("file"), (_req, res) => {
    res.status(200).json({ success: true });
  });
  app.use((err, _req, res, _next) => {
    res.status(500).json({ success: false, message: err.message });
  });

  const { baseUrl, close } = await startServer(app);

  const form = new FormData();
  form.append(
    "file",
    new Blob(["payload"], { type: "application/x-msdownload" }),
    "malware.exe",
  );

  const response = await fetch(`${baseUrl}/single`, {
    method: "POST",
    body: form,
  });
  const body = await response.json();

  assert.equal(response.status, 500);
  assert.equal(body.success, false);
  assert.match(body.message, /only image, video, and document files are allowed/i);

  await close();
});

test("uploadArray enforces max file count", async () => {
  const app = express();
  app.post("/multi", uploadArray("files", 2), (req, res) => {
    res.status(200).json({ success: true, count: req.files?.length || 0 });
  });
  app.use((err, _req, res, _next) => {
    res.status(400).json({ success: false, message: err.message, code: err.code });
  });

  const { baseUrl, close } = await startServer(app);

  const form = new FormData();
  form.append("files", new Blob(["one"], { type: "image/jpeg" }), "one.jpg");
  form.append("files", new Blob(["two"], { type: "image/jpeg" }), "two.jpg");
  form.append("files", new Blob(["three"], { type: "image/jpeg" }), "three.jpg");

  const response = await fetch(`${baseUrl}/multi`, {
    method: "POST",
    body: form,
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.code, "LIMIT_UNEXPECTED_FILE");

  await close();
});

test("uploadSingle enforces max file size", async () => {
  const app = express();
  app.post("/single", uploadSingle("file"), (_req, res) => {
    res.status(200).json({ success: true });
  });
  app.use((err, _req, res, _next) => {
    res.status(400).json({ success: false, message: err.message, code: err.code });
  });

  const { baseUrl, close } = await startServer(app);

  const form = new FormData();
  const oversizedBuffer = new Uint8Array(50 * 1024 * 1024 + 1);
  form.append(
    "file",
    new Blob([oversizedBuffer], { type: "image/jpeg" }),
    "oversize.jpg",
  );

  const response = await fetch(`${baseUrl}/single`, {
    method: "POST",
    body: form,
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.code, "LIMIT_FILE_SIZE");

  await close();
});
