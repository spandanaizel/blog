import { Router } from 'express';
import { updateUserRole } from '../controllers/adminController';
import { protect, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateUserRoleSchema } from '../utils/validators/adminValidators';

const router = Router();

router.use(protect, requireAdmin);
router.patch('/users/:id/role', validate(updateUserRoleSchema), updateUserRole);

export default router;
