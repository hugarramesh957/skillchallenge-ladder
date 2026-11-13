import Challenge from '../models/Challenge.js';
import Submission from '../models/Submission.js';
import StudentChallengeProgress from '../models/StudentChallengeProgress.js';
import {
  getCompletedChallengeIds,
  attachChallengeStatusesForStudent,
  isChallengeUnlocked,
} from '../services/unlockService.js';
import { getPersonalizedRecommendation } from '../services/recommendationService.js';

/**
 * GET /api/progress/dashboard
 * Live, MongoDB-driven statistics and recommendations for the student
 */
export const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // 1. Fetch all published challenges
    const allPublished = await Challenge.find({ isPublished: true }).populate(
      'prerequisites',
      'title difficulty'
    );
    const evaluatedChallenges = await attachChallengeStatusesForStudent(studentId, allPublished);

    // 2. Compute status counts
    const completedChallenges = evaluatedChallenges.filter((c) => c.status === 'completed');
    const inProgressChallenges = evaluatedChallenges.filter((c) => c.status === 'in_progress');
    const availableChallenges = evaluatedChallenges.filter((c) => c.status === 'available');
    const submittedChallenges = evaluatedChallenges.filter((c) => c.status === 'submitted');
    const needsRevisionChallenges = evaluatedChallenges.filter((c) => c.status === 'needs_revision');

    const totalChallenges = evaluatedChallenges.length;
    const completedCount = completedChallenges.length;
    const completionPercentage = totalChallenges > 0 ? Math.round((completedCount / totalChallenges) * 100) : 0;

    // 3. Difficulty-wise breakdown
    const difficultyBreakdown = {
      Beginner: { total: 0, completed: 0 },
      Intermediate: { total: 0, completed: 0 },
      Advanced: { total: 0, completed: 0 },
      Expert: { total: 0, completed: 0 },
    };

    for (const c of evaluatedChallenges) {
      if (difficultyBreakdown[c.difficulty]) {
        difficultyBreakdown[c.difficulty].total++;
        if (c.status === 'completed') {
          difficultyBreakdown[c.difficulty].completed++;
        }
      }
    }

    // Determine current student difficulty level
    let currentDifficulty = 'Beginner';
    if (difficultyBreakdown.Beginner.completed >= 2) {
      currentDifficulty = 'Intermediate';
    }
    if (difficultyBreakdown.Intermediate.completed >= 2) {
      currentDifficulty = 'Advanced';
    }
    if (difficultyBreakdown.Advanced.completed >= 2) {
      currentDifficulty = 'Expert';
    }

    // 4. Continue Learning (In-Progress or Needs Revision)
    const continueLearning = [
      ...needsRevisionChallenges.map((c) => ({ ...c, reasonBadge: 'Needs Improvement' })),
      ...inProgressChallenges.map((c) => ({ ...c, reasonBadge: 'In Progress' })),
    ].slice(0, 4);

    // 5. Recommended Next Challenge
    const recommendationData = await getPersonalizedRecommendation(studentId);

    // 6. Recent Activity
    const recentSubmissions = await Submission.find({ studentId })
      .populate('challengeId', 'title difficulty category')
      .populate('reviewedBy', 'name')
      .sort({ submittedAt: -1 })
      .limit(5);

    const latestFeedback = await Submission.findOne({
      studentId,
      status: { $in: ['approved', 'needs_revision'] },
      reviewerFeedback: { $exists: true, $ne: '' },
    })
      .populate('challengeId', 'title difficulty')
      .populate('reviewedBy', 'name')
      .sort({ reviewedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalChallenges,
          completedChallenges: completedCount,
          challengesInProgress: inProgressChallenges.length,
          availableChallenges: availableChallenges.length,
          pendingReviews: submittedChallenges.length,
          needsImprovement: needsRevisionChallenges.length,
          completionPercentage,
          currentDifficulty,
          difficultyBreakdown,
        },
        continueLearning,
        recommendation: recommendationData,
        recentActivity: {
          recentSubmissions,
          latestFeedback,
          recentlyCompleted: completedChallenges.slice(0, 3),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/progress/my-challenges
 */
export const getMyChallenges = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const allPublished = await Challenge.find({ isPublished: true }).populate(
      'prerequisites',
      'title difficulty slug'
    );
    const evaluated = await attachChallengeStatusesForStudent(studentId, allPublished);

    res.status(200).json({
      success: true,
      data: {
        challenges: evaluated,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/progress/:id/start
 * Starts a challenge for the student
 */
export const startChallenge = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { id } = req.params;

    const challenge = await Challenge.findById(id);
    if (!challenge || !challenge.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found or unavailable',
      });
    }

    // Security check: Must not be locked
    const unlocked = await isChallengeUnlocked(studentId, challenge._id);
    if (!unlocked) {
      return res.status(403).json({
        success: false,
        message: 'Cannot start a locked challenge. All prerequisite challenges must be completed first.',
      });
    }

    const progress = await StudentChallengeProgress.findOneAndUpdate(
      { studentId, challengeId: challenge._id },
      { $setOnInsert: { startedAt: new Date() } },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Challenge started successfully! Good luck with your practical solution.',
      data: { progress },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/progress/history
 */
export const getProgressHistory = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    const submissions = await Submission.find({ studentId })
      .populate('challengeId', 'title difficulty category skills')
      .populate('reviewedBy', 'name')
      .sort({ submittedAt: -1 });

    const startedRecords = await StudentChallengeProgress.find({ studentId })
      .populate('challengeId', 'title difficulty category')
      .sort({ startedAt: -1 });

    const completedIds = await getCompletedChallengeIds(studentId);

    res.status(200).json({
      success: true,
      data: {
        submissions,
        startedRecords,
        completedCount: completedIds.size,
      },
    });
  } catch (err) {
    next(err);
  }
};

