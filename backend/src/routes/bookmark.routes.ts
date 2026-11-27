import { Router } from 'express';
import { getBookmarks, addBookmark, removeBookmark } from '../controllers/bookmark.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all bookmark routes
router.use(authenticateToken);

router.get('/', getBookmarks);
router.post('/', addBookmark);
router.delete('/:departmentId', removeBookmark);

export default router;
