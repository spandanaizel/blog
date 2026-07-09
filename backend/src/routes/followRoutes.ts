import { Router } from 'express';
import { followUser, unfollowUser } from '../controllers/followController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.post('/:userId', followUser);
router.delete('/:userId', unfollowUser);

export default router;
