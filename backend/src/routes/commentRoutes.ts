import { Router } from 'express';
import {
  createComment,
  getCommentsForPost,
  updateComment,
  deleteComment,
  likeComment,
} from '../controllers/commentController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCommentSchema, updateCommentSchema } from '../utils/validators/commentValidators';

const router = Router();

router.post('/', protect, validate(createCommentSchema), createComment);
router.get('/:postId', getCommentsForPost);
router.put('/:id', protect, validate(updateCommentSchema), updateComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, likeComment);

export default router;
