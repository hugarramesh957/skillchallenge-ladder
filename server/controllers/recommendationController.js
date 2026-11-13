import {
  getPersonalizedRecommendation,
  getUnlockedChallenges,
} from '../services/recommendationService.js';

export const getNextRecommendation = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const recommendationData = await getPersonalizedRecommendation(studentId);

    res.status(200).json({
      success: true,
      message: 'Personalized recommendation generated successfully',
      data: recommendationData,
    });
  } catch (err) {
    next(err);
  }
};

export const getUnlocked = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const unlocked = await getUnlockedChallenges(studentId);

    res.status(200).json({
      success: true,
      count: unlocked.length,
      data: { unlocked },
    });
  } catch (err) {
    next(err);
  }
};

