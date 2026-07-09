import mongoose, { Schema, Document, Types } from 'mongoose';

export type ActivityAction =
  | 'register'
  | 'login'
  | 'create_post'
  | 'update_post'
  | 'delete_post'
  | 'publish_post'
  | 'comment'
  | 'like_post'
  | 'bookmark_post'
  | 'follow_user'
  | 'admin_delete_post'
  | 'admin_delete_user'
  | 'admin_moderate_comment'
  | 'admin_change_role';

export interface IActivityLog extends Document {
  user: Types.ObjectId;
  action: ActivityAction;
  targetId?: Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true, index: true },
    targetId: { type: Schema.Types.ObjectId },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
