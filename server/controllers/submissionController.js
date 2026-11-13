import Submission from '../models/Submission.js';
import Challenge from '../models/Challenge.js';
import StudentChallengeProgress from '../models/StudentChallengeProgress.js';
import { isChallengeUnlocked } from '../services/unlockService.js';

/**
 * POST /api/submissions
 * Student submits practical work
 */
export const createSubmission = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { challengeId, description, approach, repositoryUrl, liveProjectUrl, notes } = req.body;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found',
      });
    }

    // Security & Rule Check: Ensure challenge is unlocked for this student
    const unlocked = await isChallengeUnlocked(studentId, challengeId);
    if (!unlocked) {
      return res.status(403).json({
        success: false,
        message: 'Challenge is locked. You must complete all prerequisite challenges before submitting work.',
      });
    }

    // Determine attempt number
    const previousSubmissionsCount = await Submission.countDocuments({
      studentId,
      challengeId,
    });
    const attemptNumber = previousSubmissionsCount + 1;

    // Check if there is already a pending submission
    const existingPending = await Submission.findOne({
      studentId,
      challengeId,
      status: 'pending',
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending submission for this challenge awaiting review.',
      });
    }

    // Ensure started progress record exists
    await StudentChallengeProgress.findOneAndUpdate(
      { studentId, challengeId },
      { $setOnInsert: { startedAt: new Date() } },
      { upsert: true, new: true }
    );

    const submission = await Submission.create({
      studentId,
      challengeId,
      attemptNumber,
      description,
      approach,
      repositoryUrl: repositoryUrl || '',
      liveProjectUrl: liveProjectUrl || '',
      notes: notes || '',
      status: 'pending',
      submittedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Your work has been submitted successfully and is waiting for review.',
      data: { submission },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/submissions/my-submissions
 */
export const getMySubmissions = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const submissions = await Submission.find({ studentId })
      .populate('challengeId', 'title difficulty category skills slug')
      .populate('reviewedBy', 'name')
      .sort({ submittedAt: -1 });

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
 * GET /api/submissions/:id
 */
export const getSubmissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id)
      .populate('challengeId')
      .populate('studentId', 'name email')
      .populate('reviewedBy', 'name email');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    // Security: Students can only view their own submissions
    if (
      req.user.role === 'student' &&
      submission.studentId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this submission',
      });
    }

    // Also fetch all attempts for this challenge by this student
    const allAttempts = await Submission.find({
      studentId: submission.studentId._id,
      challengeId: submission.challengeId._id,
    })
      .sort({ attemptNumber: 1 })
      .populate('reviewedBy', 'name');

    res.status(200).json({
      success: true,
      data: {
        submission,
        allAttempts,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/submissions/pending (Reviewer only)
 */
export const getPendingSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ status: 'pending' })
      .populate('studentId', 'name email')
      .populate('challengeId', 'title difficulty category')
      .sort({ submittedAt: 1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: { submissions },
    });
  } catch (err) {
    next(err);
  }
};

