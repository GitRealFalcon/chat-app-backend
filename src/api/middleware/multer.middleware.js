import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = path.resolve("public", "uploads");

if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedDocumentMimeTypes = new Set([
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"application/vnd.ms-powerpoint",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation",
	"application/vnd.oasis.opendocument.text",
	"application/vnd.oasis.opendocument.spreadsheet",
	"application/vnd.oasis.opendocument.presentation",
	"application/rtf",
	"text/rtf",
	"text/plain",
	"text/csv",
	"application/json",
	"application/xml",
	"text/xml",
]);

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, uploadDir);
	},
	filename: (_req, file, cb) => {
		const extension = path.extname(file.originalname);
		const safeName = path
			.basename(file.originalname, extension)
			.replace(/[^a-zA-Z0-9-_]/g, "_")
			.slice(0, 50);
		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		cb(null, `${safeName}-${uniqueSuffix}${extension}`);
	},
});

const fileFilter = (_req, file, cb) => {
	const isImage = file.mimetype.startsWith("image/");
	const isVideo = file.mimetype.startsWith("video/");
	const isDocument =
		allowedDocumentMimeTypes.has(file.mimetype) ||
		file.mimetype.startsWith("text/");

	if (!isImage && !isVideo && !isDocument) {
		return cb(
			new Error(
				"Only image, video, and document files are allowed",
			),
		);
	}

	cb(null, true);
};

export const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 50 * 1024 * 1024,
	},
});

export const uploadSingle = (fieldName = "file") => upload.single(fieldName);
export const uploadArray = (fieldName = "files", maxCount = 5) =>
	upload.array(fieldName, maxCount);
