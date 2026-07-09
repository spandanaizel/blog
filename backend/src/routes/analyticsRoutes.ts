import { Router } from 'express';
import { getDashboardAnalytics, getAdminAnalytics, getUserAnalytics } from '../controllers/analyticsController';
import { protect, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(protect);
router.get('/dashboard', getDashboardAnalytics);
router.get('/admin', requireAdmin, getAdminAnalytics);
router.get('/user/:id', getUserAnalytics);

export default router;
