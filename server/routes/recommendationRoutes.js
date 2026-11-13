import express from 'express';
import {
  getNextRecommendation,
  getUnlocked,
} from '../controllers/recommendationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('student'));

router.get('/next', getNextRecommendation);
router.get('/unlocked', getUnlocked);

export default router;

