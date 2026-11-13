import Submission from '../models/Submission.js';
import Challenge from '../models/Challenge.js';
import User from '../models/User.js';
import { getUnlockedChallenges, getPersonalizedRecommendation } from '../services/recommendationService.js';
import { getCompletedChallengeIds } from '../services/unlockService.js';

/**
 * GET /api/reviewer/dashboard
 */
export const getReviewerDashboard = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalChallenges = await Challenge.countDocuments();
    const pendingSubmissions = await Submission.countDocuments({ status: 'pending' });
    const reviewedSubmissions = await Submission.countDocuments({
      status: { $in: ['approved', 'needs_revision'] },
    });
    const needsImprovementCount = await Submission.countDocuments({ status: 'needs_revision' });

    // Recent 5 pending submissions
    const recentPending = await Submission.find({ status: 'pending' })
      .populate('studentId', 'name email')
      .populate('challengeId', 'title difficulty category')
      .sort({ submittedAt: 1 })
      .limit(5);

    // Recent 5 reviewed submissions
    const recentReviewed = await Submission.find({
      status: { $in: ['approved', 'needs_revision'] },
    })
      .populate('studentId', 'name email')
      .populate('challengeId', 'title difficulty')
      .populate('reviewedBy', 'name')
      .sort({ reviewedAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalChallenges,
          pendingSubmissions,
          reviewedSubmissions,
          challengesRequiringImprovement: needsImprovementCount,
        },
        recentPending,
        recentReviewed,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reviewer/submissions
 * Review queue with filtering
 */
export const getReviewerSubmissions = async (req, res, next) => {
  try {
    const { status, challengeId, search } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (challengeId && challengeId !== 'All') {
      filter.challengeId = challengeId;
    }

    let submissions = await Submission.find(filter)
      .populate('studentId', 'name email')
      .populate('challengeId', 'title difficulty category')
      .populate('reviewedBy', 'name')
      .sort({ submittedAt: -1 });

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      submissions = submissions.filter((s) => {
        return (
          searchRegex.test(s.studentId?.name || '') ||
          searchRegex.test(s.studentId?.email || '') ||
          searchRegex.test(s.challengeId?.title || '')
        );
      });
    }

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: { submissions },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reviewer/submissions/:id
 */
export const getSubmissionDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id)
      .populate('studentId', 'name email createdAt')
      .populate('challengeId')
      .populate('reviewedBy', 'name email');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    // Previous submission history for this student & challenge
    const previousAttempts = await Submission.find({
      studentId: submission.studentId._id,
      challengeId: submission.challengeId._id,
    })
      .sort({ attemptNumber: 1 })
      .populate('reviewedBy', 'name');

    // Student's overall stats
    const studentCompletedIds = await getCompletedChallengeIds(submission.studentId._id);

    res.status(200).json({
      success: true,
      data: {
        submission,
        previousAttempts,
        studentSummary: {
          totalCompleted: studentCompletedIds.size,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/reviewer/submissions/:id/review
 * Approves or requests improvement on submission
 */
export const reviewSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reviewerId = req.user._id;

    const submission = await Submission.findById(id).populate('challengeId', 'title difficulty');
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    const {
      decision,
      score,
      correctnessRating,
      codeQualityRating,
      creativityRating,
      reviewerFeedback,
      strengths,
      improvementAreas,
      recommendedFocusTags,
    } = req.body;

    submission.status = decision; // 'approved' or 'needs_revision'
    submission.score = score;
    submission.correctnessRating = correctnessRating !== undefined ? correctnessRating : null;
    submission.codeQualityRating = codeQualityRating !== undefined ? codeQualityRating : null;
    submission.creativityRating = creativityRating !== undefined ? creativityRating : null;
    submission.reviewerFeedback = reviewerFeedback;
    submission.strengths = strengths || '';
    submission.improvementAreas = improvementAreas || '';
    submission.recommendedFocusTags = recommendedFocusTags || [];
    submission.reviewedBy = reviewerId;
    submission.reviewedAt = new Date();

    await submission.save();

    // Recalculate smart unlocking and recommendations for the student
    let newlyUnlocked = [];
    let updatedRecommendation = null;

    if (decision === 'approved') {
      newlyUnlocked = await getUnlockedChallenges(submission.studentId);
      updatedRecommendation = await getPersonalizedRecommendation(submission.studentId);
    }

    res.status(200).json({
      success: true,
      message:
        decision === 'approved'
          ? 'Submission approved successfully! Challenge marked completed and dependent challenges unlocked.'
          : 'Improvements requested. Feedback sent to student for revision.',
      data: {
        submission,
        decision,
        newlyUnlocked,
        updatedRecommendation,
      },
    });
  } catch (err) {
    next(err);
  }
};

