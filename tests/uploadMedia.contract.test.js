import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import express from "express";
import uploadMediaRoutes from "../src/api/routes/uploadMedia.routes.js";
import uploadMediaController from "../src/api/controller/uploadMedia.controller.js";
import uploadMediaService from "../src/api/service/uploadMedia.service.js";

const originalUploadMediaService = uploadMediaService.uploadMediaService;

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

test.afterEach(() => {
  uploadMediaService.uploadMediaService = originalUploadMediaService;
});

test("media routes require authentication", async () => {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/media", uploadMediaRoutes);
  app.use((err, _req, res, _next) => {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  });

  const { baseUrl, close } = await startServer(app);

  const [singleRes, multipleRes] = await Promise.all([
    fetch(`${baseUrl}/api/v1/media/single`, { method: "POST" }),
    fetch(`${baseUrl}/api/v1/media/multiple`, { method: "POST" }),
  ]);

  assert.equal(singleRes.status, 401);
  assert.equal(multipleRes.status, 401);

  await close();
});

test("upload single media returns 200 and uploaded payload", async () => {
  uploadMediaService.uploadMediaService = async (file, folder) => ({
    url: "https://cdn.example.com/media/file.jpg",
    publicId: "chatapp/media/file",
    resourceType: "image",
    format: "jpg",
    bytes: 1024,
    originalName: file.originalname,
    folder,
  });

  const app = express();
  app.use(express.json());
  app.post(
    "/single",
    (_req, _res, next) => {
      _req.file = {
        path: "public/uploads/file.jpg",
        mimetype: "image/jpeg",
        originalname: "file.jpg",
      };
      next();
    },
    uploadMediaController.uploadMedia,
  );
  app.use((err, _req, res, _next) => {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  });

  const { baseUrl, close } = await startServer(app);

  const response = await fetch(`${baseUrl}/single`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ folder: "chatapp/test" }),
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.url, "https://cdn.example.com/media/file.jpg");
  assert.equal(body.data.folder, "chatapp/test");

  await close();
});

test("upload multiple media returns 200 and list payload", async () => {
  uploadMediaService.uploadMediaService = async (file, folder) => ({
    url: `https://cdn.example.com/media/${file.originalname}`,
    publicId: `chatapp/media/${file.originalname}`,
    resourceType: "image",
    format: "jpg",
    bytes: 1024,
    originalName: file.originalname,
    folder,
  });

  const app = express();
  app.use(express.json());
  app.post(
    "/multiple",
    (_req, _res, next) => {
      _req.files = [
        { path: "public/uploads/one.jpg", mimetype: "image/jpeg", originalname: "one.jpg" },
        { path: "public/uploads/two.jpg", mimetype: "image/jpeg", originalname: "two.jpg" },
      ];
      next();
    },
    uploadMediaController.uploadMultipleMedia,
  );
  app.use((err, _req, res, _next) => {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  });

  const { baseUrl, close } = await startServer(app);

  const response = await fetch(`${baseUrl}/multiple`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ folder: "chatapp/test" }),
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(Array.isArray(body.data), true);
  assert.equal(body.data.length, 2);
  assert.equal(body.data[0].folder, "chatapp/test");

  await close();
});

test("upload single media returns 400 when no file present", async () => {
  const app = express();
  app.use(express.json());
  app.post("/single", uploadMediaController.uploadMedia);
  app.use((err, _req, res, _next) => {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  });

  const { baseUrl, close } = await startServer(app);

  const response = await fetch(`${baseUrl}/single`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.match(body.message, /no file uploaded/i);

  await close();
});
