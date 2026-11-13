import api from './api';

export const submissionService = {
  async submitWork(submissionData) {
    const response = await api.post('/submissions', submissionData);
    return response.data;
  },

  async getMySubmissions() {
    const response = await api.get('/submissions/my-submissions');
    return response.data;
  },

  async getSubmissionById(id) {
    const response = await api.get(`/submissions/${id}`);
    return response.data;
  },

  async getReviewerDashboard() {
    const response = await api.get('/reviewer/dashboard');
    return response.data;
  },

  async getReviewerSubmissions(params = {}) {
    const response = await api.get('/reviewer/submissions', { params });
    return response.data;
  },

  async getSubmissionForReview(id) {
    const response = await api.get(`/reviewer/submissions/${id}`);
    return response.data;
  },

  async reviewSubmission(id, reviewData) {
    const response = await api.post(`/reviewer/submissions/${id}/review`, reviewData);
    return response.data;
  },
};

export default submissionService;

