// src/services/mentorService.js
import { api } from './api';
import { authService } from './authService';

export const mentorService = {
  // Create a mentor log (visit record)
  createLog: async (logData) => {
    const user = authService.getCurrentUser();
    return api.post('/mentors/logs', {
      ...logData,
      mentor_id: user.userId
    });
  },

  // Get all logs for a mentor
  getMyLogs: async () => {
    const user = authService.getCurrentUser();
    return api.get(`/mentors/${user.userId}/logs`);
  },

  // Get logs for a specific entrepreneur
  getEntrepreneurLogs: async (entrepreneurId) => {
    return api.get(`/mentors/entrepreneur/${entrepreneurId}/logs`);
  },

  // Update vouch status
  updateVouchStatus: async (logId, status) => {
    return api.put(`/mentors/logs/${logId}/vouch?status=${status}`, {});
  },

  // Get current mentor's profile
  getMyProfile: async () => {
    const user = authService.getCurrentUser();
    if (user?.role === 'mentor' && user?.userId) {
      return api.get(`/users/${user.userId}`);
    }
    throw new Error('Not authenticated as mentor');
  }
};