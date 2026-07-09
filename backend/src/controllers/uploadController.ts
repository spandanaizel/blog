import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ApiError } from '../utils/ApiError';
import { sendResponse } from '../utils/sendResponse';
import { AuthRequest } from '../middleware/auth';
import { uploadImageBuffer, removeImage, UPLOAD_CATEGORIES, UploadCategory } from '../services/cloudinaryService';
import { logger } from '../utils/logger';

// POST /api/uploads/image
export const uploadImageHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const file = req.file;
  if (!file) {
    throw ApiError.badRequest('No image file provided. Attach it under the "image" field.');
  }

  const category = (req.body.category as UploadCategory) || 'editor';
  if (!UPLOAD_CATEGORIES.includes(category)) {
    throw ApiError.badRequest(`Invalid category. Must be one of: ${UPLOAD_CATEGORIES.join(', ')}`);
  }

  try {
    const result = await uploadImageBuffer(file.buffer, file.mimetype, category);
    logger.info(
      `[upload] ${req.user!.id} uploaded a ${category} image (${file.mimetype}, ${file.size} bytes) -> ${result.publicId ?? 'local fallback'}`
    );
    sendResponse(res, 201, result, 'Image uploaded successfully');
  } catch (err) {
    logger.error(`[upload] failed for user ${req.user!.id}: ${(err as Error).message}`);
    throw ApiError.internal('Image upload failed. Please try again.');
  }
});

// DELETE /api/uploads/image
export const deleteImageHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { publicId } = req.body;
  if (!publicId) {
    throw ApiError.badRequest('publicId is required.');
  }

  await removeImage(publicId);
  logger.info(`[upload] ${req.user!.id} deleted image asset ${publicId}`);
  sendResponse(res, 200, null, 'Image deleted successfully');
});
