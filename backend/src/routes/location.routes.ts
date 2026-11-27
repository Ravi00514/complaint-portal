import { Router } from 'express';
import { getLocationDetails } from '../controllers/location.controller';

const router = Router();

router.get('/', getLocationDetails);

export default router;
