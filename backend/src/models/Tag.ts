import mongoose, { Schema, Document } from 'mongoose';

export interface ITag extends Document {
  name: string;
  slug: string;
  postCount: number;
}

const tagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, unique: true, trim: true, lowercase: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    postCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

tagSchema.index({ postCount: -1 });

export const Tag = mongoose.model<ITag>('Tag', tagSchema);
