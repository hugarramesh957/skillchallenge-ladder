import api from './api';

export const challengeService = {
  async getChallenges(params = {}) {
    const response = await api.get('/challenges', { params });
    return response.data;
  },

  async getChallengeById(id) {
    const response = await api.get(`/challenges/${id}`);
    return response.data;
  },

  async getChallengeStatus(id) {
    const response = await api.get(`/challenges/${id}/status`);
    return response.data;
  },

  async createChallenge(challengeData) {
    const response = await api.post('/challenges', challengeData);
    return response.data;
  },

  async updateChallenge(id, challengeData) {
    const response = await api.put(`/challenges/${id}`, challengeData);
    return response.data;
  },

  async deleteChallenge(id) {
    const response = await api.delete(`/challenges/${id}`);
    return response.data;
  },
};

export default challengeService;

