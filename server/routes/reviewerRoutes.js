import express from 'express';
import {
  getReviewerDashboard,
  getReviewerSubmissions,
  getSubmissionDetails,
  reviewSubmission,
} from '../controllers/reviewerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { reviewSubmissionSchema } from '../validators/reviewValidators.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('reviewer'));

router.get('/dashboard', getReviewerDashboard);
router.get('/submissions', getReviewerSubmissions);
router.get('/submissions/:id', getSubmissionDetails);
router.post('/submissions/:id/review', validate(reviewSubmissionSchema), reviewSubmission);

export default router;

