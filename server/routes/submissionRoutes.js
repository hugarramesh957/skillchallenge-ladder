import express from 'express';
import {
  createSubmission,
  getMySubmissions,
  getSubmissionById,
  getPendingSubmissions,
} from '../controllers/submissionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { createSubmissionSchema } from '../validators/submissionValidators.js';

const router = express.Router();

router.use(protect);

router.post('/', restrictTo('student'), validate(createSubmissionSchema), createSubmission);
router.get('/my-submissions', restrictTo('student'), getMySubmissions);
router.get('/pending', restrictTo('reviewer'), getPendingSubmissions);
router.get('/:id', getSubmissionById);

export default router;

