import Challenge from '../models/Challenge.js';
import Submission from '../models/Submission.js';
import {
  attachChallengeStatusesForStudent,
  getChallengeStatusForStudent,
  checkCircularPrerequisites,
} from '../services/unlockService.js';

// Helper to create URL-friendly slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

/**
 * GET /api/challenges
 * Query: difficulty, category, status, search, sort
 */
export const getChallenges = async (req, res, next) => {
  try {
    const { difficulty, category, status, search, sort } = req.query;

    const query = {};

    // Only reviewers can view unpublished challenges
    if (!req.user || req.user.role !== 'reviewer') {
      query.isPublished = true;
    }

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { skills: { $in: [new RegExp(search.trim(), 'i')] } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'duration_asc') {
      sortOption = { estimatedMinutes: 1 };
    } else if (sort === 'duration_desc') {
      sortOption = { estimatedMinutes: -1 };
    }

    let challenges = await Challenge.find(query)
      .populate('prerequisites', 'title difficulty slug')
      .sort(sortOption);

    // If authenticated student, calculate dynamic unlock statuses
    if (req.user && req.user.role === 'student') {
      challenges = await attachChallengeStatusesForStudent(req.user._id, challenges);

      // Filter by dynamic status if requested
      if (status && status !== 'All') {
        challenges = challenges.filter((c) => c.status === status.toLowerCase());
      }
    }

    // Sort by difficulty if requested
    if (sort === 'difficulty_asc' || sort === 'difficulty_desc') {
      const order = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };
      challenges.sort((a, b) => {
        const diffA = order[a.difficulty] || 1;
        const diffB = order[b.difficulty] || 1;
        return sort === 'difficulty_asc' ? diffA - diffB : diffB - diffA;
      });
    }

    res.status(200).json({
      success: true,
      count: challenges.length,
      data: { challenges },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/challenges/:id
 */
export const getChallengeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Support query by ObjectId or slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { _id: id } : { slug: id };

    const challenge = await Challenge.findOne(query).populate(
      'prerequisites',
      'title difficulty slug skills estimatedMinutes'
    );

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found',
      });
    }

    const cObj = challenge.toObject();

    // Attach student specific status and unlock data
    if (req.user && req.user.role === 'student') {
      const status = await getChallengeStatusForStudent(req.user._id, challenge._id);
      cObj.status = status;
      cObj.isUnlocked = status !== 'locked';

      // Find previous submissions
      const submissions = await Submission.find({
        studentId: req.user._id,
        challengeId: challenge._id,
      }).sort({ attemptNumber: -1 });

      cObj.submissions = submissions;
      cObj.latestSubmission = submissions[0] || null;
    }

    res.status(200).json({
      success: true,
      data: { challenge: cObj },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/challenges/:id/status
 */
export const getChallengeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    const challenge = await Challenge.findById(id).populate('prerequisites', 'title difficulty');
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found',
      });
    }

    const status = await getChallengeStatusForStudent(studentId, challenge._id);

    res.status(200).json({
      success: true,
      data: {
        challengeId: challenge._id,
        status,
        isUnlocked: status !== 'locked',
        prerequisites: challenge.prerequisites,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/challenges (Reviewer only)
 */
export const createChallenge = async (req, res, next) => {
  try {
    const {
      title,
      description,
      problemStatement,
      instructions,
      difficulty,
      category,
      skills,
      estimatedMinutes,
      deliverables,
      hints,
      prerequisites,
      isPublished,
    } = req.body;

    // Check circular prerequisites
    if (prerequisites && prerequisites.length > 0) {
      const isCircular = await checkCircularPrerequisites(null, prerequisites);
      if (isCircular) {
        return res.status(400).json({
          success: false,
          message: 'Circular prerequisite detected. Challenges cannot form dependency cycles.',
        });
      }
    }

    // Generate unique slug
    let baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await Challenge.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const challenge = await Challenge.create({
      title,
      slug,
      description,
      problemStatement,
      instructions,
      difficulty,
      category,
      skills: skills || [],
      estimatedMinutes: estimatedMinutes || 60,
      deliverables: deliverables || [],
      hints: hints || [],
      prerequisites: prerequisites || [],
      isPublished: isPublished !== undefined ? isPublished : true,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Challenge created successfully',
      data: { challenge },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/challenges/:id (Reviewer only)
 */
export const updateChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const challenge = await Challenge.findById(id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found',
      });
    }

    const { prerequisites } = req.body;

    // Check circular prerequisites if prerequisites are being updated
    if (prerequisites && prerequisites.length > 0) {
      const isCircular = await checkCircularPrerequisites(id, prerequisites);
      if (isCircular) {
        return res.status(400).json({
          success: false,
          message: 'Circular prerequisite detected. A challenge cannot depend on itself or its descendants.',
        });
      }
    }

    Object.assign(challenge, req.body);
    await challenge.save();

    res.status(200).json({
      success: true,
      message: 'Challenge updated successfully',
      data: { challenge },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/challenges/:id (Reviewer only)
 */
export const deleteChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if other challenges depend on this challenge
    const dependents = await Challenge.find({ prerequisites: id });
    if (dependents.length > 0) {
      const dependentTitles = dependents.map((d) => d.title).join(', ');
      return res.status(400).json({
        success: false,
        message: `Cannot delete this challenge because it is a prerequisite for: ${dependentTitles}. Remove the prerequisite references first.`,
      });
    }

    const challenge = await Challenge.findByIdAndDelete(id);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Challenge deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

