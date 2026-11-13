import Challenge from '../models/Challenge.js';
import Submission from '../models/Submission.js';
import { getCompletedChallengeIds, attachChallengeStatusesForStudent } from './unlockService.js';

const DIFFICULTY_ORDER = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4,
};

const DIFFICULTY_REVERSE = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
  4: 'Expert',
};

/**
 * Generates personalized next-challenge recommendations based on student's actual history and review feedback.
 */
export const getPersonalizedRecommendation = async (studentId) => {
  // 1. Fetch student's submissions with reviews
  const allSubmissions = await Submission.find({ studentId })
    .populate('challengeId', 'title difficulty skills category')
    .sort({ submittedAt: -1 });

  const completedIds = await getCompletedChallengeIds(studentId);

  // Collect pending challenge IDs (awaiting review)
  const pendingChallengeIds = new Set(
    allSubmissions
      .filter((s) => s.status === 'pending')
      .map((s) => s.challengeId?._id?.toString() || s.challengeId?.toString())
  );

  // Collect latest reviewer feedback tags and scores
  const reviewedSubmissions = allSubmissions.filter(
    (s) => s.status === 'approved' || s.status === 'needs_revision'
  );

  let recentFeedbackTags = [];
  let recentStrengths = [];
  let recentImprovementAreas = [];
  let scores = [];

  for (const sub of reviewedSubmissions) {
    if (sub.score !== null && sub.score !== undefined) {
      scores.push(sub.score);
    }
    if (sub.recommendedFocusTags && sub.recommendedFocusTags.length > 0) {
      recentFeedbackTags.push(...sub.recommendedFocusTags);
    }
    if (sub.improvementAreas) {
      recentImprovementAreas.push(sub.improvementAreas);
    }
    if (sub.strengths) {
      recentStrengths.push(sub.strengths);
    }
  }

  // Deduplicate tags (case insensitive)
  const focusTagSet = new Set(recentFeedbackTags.map((t) => t.toLowerCase().trim()));

  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const latestReview = reviewedSubmissions[0] || null;

  // 2. Fetch all published challenges
  const allChallenges = await Challenge.find({ isPublished: true }).populate('prerequisites', 'title difficulty');
  const evaluatedChallenges = await attachChallengeStatusesForStudent(studentId, allChallenges);

  // 3. Filter candidates: must be unlocked and not completed, not pending review
  const availableCandidates = evaluatedChallenges.filter((c) => {
    const cIdStr = c._id.toString();
    if (completedIds.has(cIdStr)) return false;
    if (pendingChallengeIds.has(cIdStr)) return false;
    return c.isUnlocked; // All prerequisites completed
  });

  if (availableCandidates.length === 0) {
    return {
      recommendation: null,
      message: 'You have either completed all available challenges or are waiting for pending reviews. Great work!',
      unlockedCount: 0,
    };
  }

  // Calculate highest difficulty level completed
  let maxCompletedDiffLevel = 1;
  for (const c of evaluatedChallenges) {
    if (completedIds.has(c._id.toString())) {
      const level = DIFFICULTY_ORDER[c.difficulty] || 1;
      if (level > maxCompletedDiffLevel) {
        maxCompletedDiffLevel = level;
      }
    }
  }

  // Determine target difficulty level
  let targetDifficultyLevel = 1;
  let reason = '';

  if (completedIds.size === 0) {
    targetDifficultyLevel = 1;
    reason = 'Starting point: As a new learner, this beginner challenge introduces foundational practical concepts.';
  } else if (avgScore !== null && avgScore >= 80) {
    // High performer: encourage advancement
    targetDifficultyLevel = Math.min(4, maxCompletedDiffLevel + 1);
    reason = `Based on your high performance (${avgScore}% average score), you are ready to level up to ${DIFFICULTY_REVERSE[targetDifficultyLevel]} challenges!`;
  } else if (avgScore !== null && avgScore < 70) {
    // Needs reinforcement
    targetDifficultyLevel = maxCompletedDiffLevel;
    reason = `To strengthen your core skills and improve confidence, here is a targeted challenge at the ${DIFFICULTY_REVERSE[targetDifficultyLevel]} level.`;
  } else {
    // Steady progress
    targetDifficultyLevel = maxCompletedDiffLevel;
    reason = `Continuing your progression along the ${DIFFICULTY_REVERSE[targetDifficultyLevel]} ladder.`;
  }

  // Score each candidate challenge to rank recommendations
  const scoredCandidates = availableCandidates.map((candidate) => {
    let matchScore = 0;
    let specificReason = '';

    // A. Match against reviewer recommended focus tags
    const candidateSkills = (candidate.skills || []).map((s) => s.toLowerCase().trim());
    const matchedSkills = candidateSkills.filter((s) => focusTagSet.has(s));

    if (matchedSkills.length > 0) {
      matchScore += 40 * matchedSkills.length;
      specificReason = `Recommended because you completed previous work and your reviewer specifically suggested strengthening ${matchedSkills.join(', ')}.`;
    }

    // B. Difficulty alignment
    const candidateLevel = DIFFICULTY_ORDER[candidate.difficulty] || 1;
    if (candidateLevel === targetDifficultyLevel) {
      matchScore += 30;
    } else if (Math.abs(candidateLevel - targetDifficultyLevel) === 1) {
      matchScore += 15;
    }

    // C. Already in progress preference (encourage finishing started work)
    if (candidate.status === 'in_progress' || candidate.status === 'needs_revision') {
      matchScore += 25;
      if (candidate.status === 'needs_revision') {
        matchScore += 30; // High priority to revise
        specificReason = 'Needs Revision: Update your submission incorporating the reviewer feedback to unlock your next tier.';
      } else if (!specificReason) {
        specificReason = 'You have already started this challenge. Complete it to continue your ladder progression.';
      }
    }

    // D. If candidate requires recently completed challenge as direct prerequisite
    const hasRecentPrereq = (candidate.prerequisites || []).some((p) => {
      const pId = p._id ? p._id.toString() : p.toString();
      return latestReview && (latestReview.challengeId?._id?.toString() === pId || latestReview.challengeId?.toString() === pId);
    });

    if (hasRecentPrereq) {
      matchScore += 20;
      if (!specificReason) {
        specificReason = `Direct Next Step: Newly unlocked after your successful completion of "${latestReview?.challengeId?.title || 'the previous challenge'}".`;
      }
    }

    return {
      challenge: candidate,
      matchScore,
      finalReason: specificReason || reason,
    };
  });

  // Sort by highest matchScore, then by lowest difficulty level to ensure sensible progression
  scoredCandidates.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    const diffA = DIFFICULTY_ORDER[a.challenge.difficulty] || 1;
    const diffB = DIFFICULTY_ORDER[b.challenge.difficulty] || 1;
    return diffA - diffB;
  });

  const bestMatch = scoredCandidates[0];

  return {
    recommendation: bestMatch.challenge,
    reason: bestMatch.finalReason,
    averageScore: avgScore,
    completedCount: completedIds.size,
    totalAvailable: availableCandidates.length,
    matchedTags: Array.from(focusTagSet),
    allCandidates: scoredCandidates.slice(0, 3).map((item) => ({
      challenge: item.challenge,
      reason: item.finalReason,
    })),
  };
};

/**
 * Returns newly unlocked challenges for a student.
 */
export const getUnlockedChallenges = async (studentId) => {
  const allChallenges = await Challenge.find({ isPublished: true }).populate('prerequisites', 'title difficulty');
  const evaluated = await attachChallengeStatusesForStudent(studentId, allChallenges);
  const completedIds = await getCompletedChallengeIds(studentId);

  // Return challenges that are unlocked and not yet completed
  const unlocked = evaluated.filter((c) => c.isUnlocked && !completedIds.has(c._id.toString()));
  return unlocked;
};

