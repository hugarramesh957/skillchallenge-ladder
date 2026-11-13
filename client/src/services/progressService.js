import api from './api';

export const progressService = {
  async getDashboard() {
    const response = await api.get('/progress/dashboard');
    return response.data;
  },

  async getMyChallenges() {
    const response = await api.get('/progress/my-challenges');
    return response.data;
  },

  async startChallenge(id) {
    const response = await api.post(`/progress/${id}/start`);
    return response.data;
  },

  async getProgressHistory() {
    const response = await api.get('/progress/history');
    return response.data;
  },
};

export default progressService;

