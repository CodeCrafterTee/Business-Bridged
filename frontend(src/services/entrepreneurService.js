// src/services/entrepreneurService.js
import { api } from './api';

export const entrepreneurService = {
  // Get all entrepreneurs
  getAll: async () => {
    return api.get('/entrepreneurs/');
  },

  // Get entrepreneur by ID
  getById: async (entrepreneurId) => {
    return api.get(`/entrepreneurs/${entrepreneurId}`);
  },

  // Get grooming progress
  getGroomingProgress: async (entrepreneurId) => {
    return api.get(`/entrepreneurs/${entrepreneurId}/grooming`);
  },

  // Get business plans
  getBusinessPlans: async (entrepreneurId) => {
    return api.get(`/entrepreneurs/${entrepreneurId}/business-plans`);
  },

  // Get stress tests
  getStressTests: async (entrepreneurId) => {
    return api.get(`/entrepreneurs/${entrepreneurId}/stress-tests`);
  },

  // Update readiness score
  updateReadinessScore: async (entrepreneurId, score) => {
    return api.put(`/entrepreneurs/${entrepreneurId}/readiness-score?score=${score}`, {});
  },

  // Get current entrepreneur's data (if logged in as entrepreneur)
  getMyProfile: async () => {
    const user = authService.getCurrentUser();
    if (user?.role === 'entrepreneur' && user?.userId) {
      return api.get(`/entrepreneurs/${user.userId}`);
    }
    throw new Error('Not authenticated as entrepreneur');
  }
};

// Import authService at the top
import { authService } from './authService';