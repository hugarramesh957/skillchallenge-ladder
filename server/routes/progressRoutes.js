import express from 'express';
import {
  getStudentDashboard,
  getMyChallenges,
  startChallenge,
  getProgressHistory,
} from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('student'));

router.get('/dashboard', getStudentDashboard);
router.get('/my-challenges', getMyChallenges);
router.post('/:id/start', startChallenge);
router.get('/history', getProgressHistory);

export default router;

