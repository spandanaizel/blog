import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  coverImagePublicId?: string;
  tags: string[];
  category: string;
  author: Types.ObjectId;
  readTime: number;
  views: number;
  likes: Types.ObjectId[];
  bookmarks: Types.ObjectId[];
  commentsCount: number;
  status: 'draft' | 'published';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true },
    excerpt: { type: String, default: '', maxlength: 300 },
    coverImage: { type: String, default: '' },
    coverImagePublicId: { type: String, default: '' },
    tags: [{ type: String, trim: true, lowercase: true }],
    category: { type: String, default: 'general', trim: true, lowercase: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    readTime: { type: Number, default: 1 },
    views: { type: Number, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    commentsCount: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

postSchema.index({ title: 'text', excerpt: 'text', tags: 'text' });
postSchema.index({ createdAt: -1 });
postSchema.index({ views: -1 });

export const Post = mongoose.model<IPost>('Post', postSchema);
