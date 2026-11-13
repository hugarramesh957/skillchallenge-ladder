import express from 'express';
import jwt from 'jsonwebtoken';
import {
  getChallenges,
  getChallengeById,
  getChallengeStatus,
  createChallenge,
  updateChallenge,
  deleteChallenge,
} from '../controllers/challengeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  createChallengeSchema,
  updateChallengeSchema,
} from '../validators/challengeValidators.js';
import User from '../models/User.js';

const router = express.Router();

// Helper middleware: extracts user if token provided, but doesn't block unauthenticated visitors
const optionalAuth = async (req, res, next) => {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'skillchallenge_ladder_super_secret_jwt_key_2026_secure'
      );
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // Ignore token failure for public access
    }
  }
  next();
};

router.get('/', optionalAuth, getChallenges);
router.get('/:id', optionalAuth, getChallengeById);
router.get('/:id/status', protect, restrictTo('student'), getChallengeStatus);

// Reviewer routes
router.post('/', protect, restrictTo('reviewer'), validate(createChallengeSchema), createChallenge);
router.put('/:id', protect, restrictTo('reviewer'), validate(updateChallengeSchema), updateChallenge);
router.delete('/:id', protect, restrictTo('reviewer'), deleteChallenge);

export default router;

