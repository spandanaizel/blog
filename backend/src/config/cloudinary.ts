import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a base64 / local file path / buffer-derived data URI to Cloudinary.
 * If Cloudinary credentials are not configured (e.g. during local dev without
 * keys), this falls back to returning the input as-is so the rest of the app
 * keeps working with a placeholder URL instead of crashing.
 */
export async function uploadImage(
  filePathOrDataUri: string,
  folder = 'blog-platform'
): Promise<{ url: string; publicId: string | null }> {
  const isConfigured = Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

  if (!isConfigured) {
    return { url: filePathOrDataUri, publicId: null };
  }

  const result = await cloudinary.uploader.upload(filePathOrDataUri, {
    folder,
    resource_type: 'image',
  });

  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteImage(publicId: string): Promise<void> {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Non-fatal: image cleanup failure shouldn't break the main flow
  }
}

export default cloudinary;
