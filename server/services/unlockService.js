import Challenge from '../models/Challenge.js';
import Submission from '../models/Submission.js';
import StudentChallengeProgress from '../models/StudentChallengeProgress.js';

/**
 * Returns a Set of challenge IDs that the student has successfully completed (approved submission).
 */
export const getCompletedChallengeIds = async (studentId) => {
  const approvedSubmissions = await Submission.find({
    studentId,
    status: 'approved',
  }).select('challengeId');

  return new Set(approvedSubmissions.map((s) => s.challengeId.toString()));
};

/**
 * Calculates the status of a specific challenge for a student:
 * 'completed' | 'submitted' | 'needs_revision' | 'in_progress' | 'available' | 'locked'
 */
export const getChallengeStatusForStudent = async (studentId, challengeId, preloadedCompletedIds = null) => {
  const completedIds = preloadedCompletedIds || (await getCompletedChallengeIds(studentId));
  const challengeIdStr = challengeId.toString();

  // 1. If approved submission exists, it's completed
  if (completedIds.has(challengeIdStr)) {
    return 'completed';
  }

  // 2. Check latest submission
  const latestSubmission = await Submission.findOne({
    studentId,
    challengeId,
  }).sort({ attemptNumber: -1 });

  if (latestSubmission) {
    if (latestSubmission.status === 'pending') {
      return 'submitted';
    }
    if (latestSubmission.status === 'needs_revision') {
      return 'needs_revision';
    }
  }

  // 3. Check prerequisites to see if available or locked
  const challenge = await Challenge.findById(challengeId).select('prerequisites');
  if (!challenge) {
    throw new Error('Challenge not found');
  }

  const prereqIds = (challenge.prerequisites || []).map((id) => id.toString());
  const allPrereqsMet = prereqIds.every((prereqId) => completedIds.has(prereqId));

  if (!allPrereqsMet) {
    return 'locked';
  }

  // 4. Prereqs are met: check if started
  const progress = await StudentChallengeProgress.findOne({
    studentId,
    challengeId,
  });

  if (progress) {
    return 'in_progress';
  }

  return 'available';
};

/**
 * Check if a challenge is unlocked (available to start or submit) for a student.
 */
export const isChallengeUnlocked = async (studentId, challengeId) => {
  const completedIds = await getCompletedChallengeIds(studentId);
  const challenge = await Challenge.findById(challengeId).select('prerequisites');
  if (!challenge) return false;

  const prereqs = (challenge.prerequisites || []).map((id) => id.toString());
  return prereqs.every((prereqId) => completedIds.has(prereqId));
};

/**
 * Evaluates all published challenges for a student and attaches:
 * - status: 'completed' | 'submitted' | 'needs_revision' | 'in_progress' | 'available' | 'locked'
 * - isUnlocked: boolean
 * - missingPrerequisites: array of prerequisite challenge titles not yet completed
 */
export const attachChallengeStatusesForStudent = async (studentId, challenges) => {
  const completedIds = await getCompletedChallengeIds(studentId);

  // Fetch all submissions by this student
  const submissions = await Submission.find({ studentId }).sort({ attemptNumber: -1 });
  const submissionsByChallenge = new Map();
  for (const sub of submissions) {
    const cId = sub.challengeId.toString();
    if (!submissionsByChallenge.has(cId)) {
      submissionsByChallenge.set(cId, sub);
    }
  }

  // Fetch all progress started records
  const progressRecords = await StudentChallengeProgress.find({ studentId });
  const startedChallengeIds = new Set(progressRecords.map((p) => p.challengeId.toString()));

  // Map of all challenges for quick title lookup
  const challengeMap = new Map();
  for (const c of challenges) {
    challengeMap.set(c._id.toString(), c);
  }

  return challenges.map((challenge) => {
    const cObj = challenge.toObject ? challenge.toObject() : { ...challenge };
    const cIdStr = cObj._id.toString();

    // Check completion
    if (completedIds.has(cIdStr)) {
      cObj.status = 'completed';
      cObj.isUnlocked = true;
      cObj.missingPrerequisites = [];
      return cObj;
    }

    // Check submissions
    const latestSub = submissionsByChallenge.get(cIdStr);
    if (latestSub) {
      if (latestSub.status === 'pending') {
        cObj.status = 'submitted';
        cObj.isUnlocked = true;
        cObj.missingPrerequisites = [];
        cObj.latestSubmission = latestSub;
        return cObj;
      }
      if (latestSub.status === 'needs_revision') {
        cObj.status = 'needs_revision';
        cObj.isUnlocked = true;
        cObj.missingPrerequisites = [];
        cObj.latestSubmission = latestSub;
        return cObj;
      }
    }

    // Check prerequisites
    const prereqIds = (cObj.prerequisites || []).map((p) => (p._id ? p._id.toString() : p.toString()));
    const missingPrereqs = prereqIds
      .filter((id) => !completedIds.has(id))
      .map((id) => {
        const found = challengeMap.get(id);
        return found ? found.title : 'Required Prerequisite';
      });

    const isUnlocked = missingPrereqs.length === 0;
    cObj.isUnlocked = isUnlocked;
    cObj.missingPrerequisites = missingPrereqs;

    if (!isUnlocked) {
      cObj.status = 'locked';
    } else if (startedChallengeIds.has(cIdStr)) {
      cObj.status = 'in_progress';
    } else {
      cObj.status = 'available';
    }

    return cObj;
  });
};

/**
 * Checks for circular prerequisites to prevent infinite dependency loops.
 */
export const checkCircularPrerequisites = async (challengeId, prerequisiteIds) => {
  if (!prerequisiteIds || prerequisiteIds.length === 0) return false;

  const currentIdStr = challengeId ? challengeId.toString() : null;

  // Direct self-dependency
  if (currentIdStr && prerequisiteIds.some((p) => p.toString() === currentIdStr)) {
    return true;
  }

  // BFS / DFS to check if currentId is reachable from any prerequisite
  const visited = new Set();
  const queue = [...prerequisiteIds.map((p) => p.toString())];

  while (queue.length > 0) {
    const nextId = queue.shift();
    if (currentIdStr && nextId === currentIdStr) {
      return true;
    }

    if (!visited.has(nextId)) {
      visited.add(nextId);
      const parentChallenge = await Challenge.findById(nextId).select('prerequisites');
      if (parentChallenge && parentChallenge.prerequisites) {
        for (const p of parentChallenge.prerequisites) {
          queue.push(p.toString());
        }
      }
    }
  }

  return false;
};

