import { Router } from 'express';
import { addBookmark, removeBookmark, getBookmarks } from '../controllers/bookmarkController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.post('/', addBookmark);
router.delete('/:id', removeBookmark);
router.get('/', getBookmarks);

export default router;
