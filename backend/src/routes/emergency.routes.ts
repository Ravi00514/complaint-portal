import { Router } from 'express';
import {
  getEmergencyContacts,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} from '../controllers/emergency.controller';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getEmergencyContacts);
router.post('/', authenticateToken, isAdmin, createEmergencyContact);
router.put('/:id', authenticateToken, isAdmin, updateEmergencyContact);
router.delete('/:id', authenticateToken, isAdmin, deleteEmergencyContact);

export default router;
