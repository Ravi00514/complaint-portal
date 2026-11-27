import { Router } from 'express';
import { 
  createComplaint, 
  getUserComplaints, 
  getAllComplaints, 
  updateComplaintStatus, 
  replyComplaint,
  parseComplaintAI, 
  getTTSAudio 
} from '../controllers/complaint.controller';

const router = Router();

// /api/complaints
router.post('/', createComplaint);
router.get('/', getUserComplaints);
router.get('/all', getAllComplaints);
router.patch('/:id/status', updateComplaintStatus);
router.post('/:id/status', updateComplaintStatus);
router.put('/:id/status', updateComplaintStatus);
router.post('/:id/reply', replyComplaint);
router.post('/ai-parse', parseComplaintAI);
router.get('/tts', getTTSAudio);

export default router;
