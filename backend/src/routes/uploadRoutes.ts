import { Router } from 'express';
import { uploadImageHandler, deleteImageHandler } from '../controllers/uploadController';
import { protect } from '../middleware/auth';
import { uploadImageMiddleware } from '../middleware/upload';

const router = Router();

router.use(protect);
router.post('/image', uploadImageMiddleware, uploadImageHandler);
router.delete('/image', deleteImageHandler);

export default router;
