import api from './api';

export const recommendationService = {
  async getNextRecommendation() {
    const response = await api.get('/recommendations/next');
    return response.data;
  },

  async getUnlockedChallenges() {
    const response = await api.get('/recommendations/unlocked');
    return response.data;
  },
};

export default recommendationService;

