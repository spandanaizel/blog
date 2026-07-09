import slugify from 'slugify';
import { Post } from '../models/Post';

export async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title, { lower: true, strict: true, trim: true }).slice(0, 100);
  let slug = base;
  let counter = 1;

  // eslint-disable-next-line no-await-in-loop
  while (await Post.exists({ slug })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
}

export function estimateReadTime(content: string): number {
  const plainText = content.replace(/<[^>]*>/g, ' ');
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = 200;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function generateExcerpt(content: string, length = 160): string {
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return plainText.length > length ? `${plainText.slice(0, length)}…` : plainText;
}
