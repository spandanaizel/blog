import { Router } from 'express';
import { getMyActivityFeed } from '../controllers/activityController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getMyActivityFeed);

export default router;
