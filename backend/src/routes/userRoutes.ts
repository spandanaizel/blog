import { Router } from 'express';
import {
  listUsers,
  getUserByUsername,
  getMyProfile,
  updateMyProfile,
  changePassword,
  getUserPostsHandler,
  getUserFollowers,
  getUserFollowing,
} from '../controllers/userController';
import { protect, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema, changePasswordSchema } from '../utils/validators/userValidators';

const router = Router();

// Specific routes before the dynamic `:username` route so they aren't shadowed.
router.get('/profile/me', protect, getMyProfile);
router.put('/profile', protect, validate(updateProfileSchema), updateMyProfile);
router.put('/change-password', protect, validate(changePasswordSchema), changePassword);

router.get('/', optionalAuth, listUsers);
router.get('/:username', optionalAuth, getUserByUsername);
router.get('/:id/posts', optionalAuth, getUserPostsHandler);
router.get('/:id/followers', optionalAuth, getUserFollowers);
router.get('/:id/following', optionalAuth, getUserFollowing);

export default router;
