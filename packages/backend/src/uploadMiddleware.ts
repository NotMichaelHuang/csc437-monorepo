import { Request, Response, NextFunction } from "express";
import multer from "multer";
import fs from "fs";

// A custom error to throw when file isn’t an image
class ImageFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageFormatError";
  }
}

const IMAGE_UPLOAD_DIR = process.env.IMAGE_UPLOAD_DIR || "uploads";
if (!fs.existsSync(IMAGE_UPLOAD_DIR)) {
  fs.mkdirSync(IMAGE_UPLOAD_DIR, { recursive: true });
}

const storageEngine = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, IMAGE_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new ImageFormatError("Unsupported image type"), "");
    }
    let ext = file.mimetype.split("/")[1] || "";
    if (ext === "jpeg") ext = "jpg";
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const filename = `${timestamp}-${random}.${ext}`;
    return cb(null, filename);
  },
});

export const imageMiddlewareFactory = multer({
  storage: storageEngine,
  limits: {
    files: 1,
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new ImageFormatError("Uploaded file is not a valid image"));
    }
  },
});

export function handleImageFileErrors(
    err: any,
    _req: Request,
    res: Response,
    next: NextFunction
): Response | void {
    if (err instanceof multer.MulterError || err instanceof ImageFormatError) {
        return res.status(400).json({
            error: "Bad Request",
            message: err.message,
        });
    }
    next(err);
}
