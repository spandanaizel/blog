import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { ApiError } from '../utils/ApiError';

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(ApiError.badRequest(`Unsupported image type "${file.mimetype}". Allowed: JPEG, PNG, WEBP, GIF.`));
    return;
  }
  cb(null, true);
}

const storage = multer.memoryStorage();

/** Single-file image upload, expects the file under the "image" field. */
export const uploadImageMiddleware = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
  fileFilter,
}).single('image');
