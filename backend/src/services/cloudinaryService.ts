import { uploadImage, deleteImage } from '../config/cloudinary';

export type UploadCategory = 'avatar' | 'cover' | 'editor';

export const UPLOAD_CATEGORIES: UploadCategory[] = ['avatar', 'cover', 'editor'];

const FOLDER_BY_CATEGORY: Record<UploadCategory, string> = {
  avatar: 'blog-platform/avatars',
  cover: 'blog-platform/covers',
  editor: 'blog-platform/editor',
};

export interface UploadResult {
  url: string;
  publicId: string | null;
}

/**
 * Uploads an in-memory image buffer (from multer) to Cloudinary, routed to a
 * category-specific folder. Falls back gracefully (see config/cloudinary.ts)
 * if Cloudinary credentials aren't configured — the caller always gets back
 * a usable `url`, just without a `publicId` to manage deletion by.
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  mimetype: string,
  category: UploadCategory
): Promise<UploadResult> {
  const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`;
  const folder = FOLDER_BY_CATEGORY[category] ?? 'blog-platform/misc';
  return uploadImage(dataUri, folder);
}

export async function removeImage(publicId: string): Promise<void> {
  return deleteImage(publicId);
}
