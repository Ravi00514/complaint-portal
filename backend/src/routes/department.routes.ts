import { Router } from 'express';
import {
  getDepartments,
  getNearestDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/department.controller';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = Router();

// Spatial queries first to prevent clash with '/:id' patterns
router.get('/nearest', getNearestDepartments);
router.get('/', getDepartments);

// Admin-protected endpoints
router.post('/', authenticateToken, isAdmin, createDepartment);
router.put('/:id', authenticateToken, isAdmin, updateDepartment);
router.delete('/:id', authenticateToken, isAdmin, deleteDepartment);

export default router;
