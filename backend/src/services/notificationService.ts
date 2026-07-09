import { Notification, NotificationType } from '../models/Notification';
import { emitToUser } from '../sockets';
import { Types } from 'mongoose';

interface CreateNotificationInput {
  recipient: string | Types.ObjectId;
  sender: string | Types.ObjectId;
  type: NotificationType;
  message: string;
  post?: string | Types.ObjectId;
  comment?: string | Types.ObjectId;
}

export async function createNotification(input: CreateNotificationInput) {
  // Don't notify users about their own actions
  if (input.recipient.toString() === input.sender.toString()) return null;

  const notification = await Notification.create(input);
  const populated = await notification.populate('sender', 'name username avatar');

  emitToUser(input.recipient.toString(), 'notification:new', populated);
  return populated;
}
