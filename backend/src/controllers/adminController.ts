import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { sendResponse } from '../utils/sendResponse';
import { AuthRequest } from '../middleware/auth';
import { toUserPayload } from '../utils/userPayload';
import { isValidObjectId } from '../services/userService';
import { ActivityLog } from '../models/ActivityLog';
import { createNotification } from '../services/notificationService';
import { logger } from '../utils/logger';

// PATCH /api/admin/users/:id/role
export const updateUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body as { role: 'user' | 'admin' };

  if (!isValidObjectId(id)) {
    throw ApiError.badRequest('Invalid user id.');
  }

  // An admin can never change their own role through this endpoint — prevents
  // both accidental self-demotion (locking yourself out) and self-escalation games.
  if (id === req.user!.id) {
    throw ApiError.badRequest('You cannot change your own role.');
  }

  const targetUser = await User.findById(id);
  if (!targetUser) {
    throw ApiError.notFound('User not found.');
  }

  if (targetUser.role === role) {
    sendResponse(res, 200, { user: toUserPayload(targetUser) }, `User is already a${role === 'admin' ? 'n' : ''} ${role}.`);
    return;
  }

  const previousRole = targetUser.role;
  targetUser.role = role;
  await targetUser.save();

  await ActivityLog.create({
    user: req.user!.id,
    action: 'admin_change_role',
    targetId: targetUser._id,
    metadata: { previousRole, newRole: role },
  });

  await createNotification({
    recipient: targetUser._id,
    sender: req.user!.id,
    type: 'role_change',
    message:
      role === 'admin'
        ? 'You have been granted admin privileges.'
        : 'Your admin privileges have been revoked.',
  });

  logger.warn(
    `[admin] ${req.user!.id} changed role of user ${targetUser._id} from "${previousRole}" to "${role}"`
  );

  sendResponse(res, 200, { user: toUserPayload(targetUser) }, 'User role updated successfully');
});
