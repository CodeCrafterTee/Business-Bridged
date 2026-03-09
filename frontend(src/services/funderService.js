// src/services/funderService.js
import { api } from './api';
import { authService } from './authService';

export const funderService = {
  // Get all funders
  getAll: async () => {
    return api.get('/funders/');
  },

  // Get funder by ID
  getById: async (funderId) => {
    return api.get(`/funders/${funderId}`);
  },

  // Create a match (entrepreneur applies to funder)
  createMatch: async (entrepreneurId, funderId) => {
    return api.post('/funders/matches', {
      entrepreneur_id: entrepreneurId,
      funder_id: funderId,
      application_status: 'pending'
    });
  },

  // Get matches for an entrepreneur
  getEntrepreneurMatches: async (entrepreneurId) => {
    return api.get(`/funders/matches/entrepreneur/${entrepreneurId}`);
  },

  // Get matches for a funder
  getFunderMatches: async (funderId) => {
    return api.get(`/funders/matches/funder/${funderId}`);
  },

  // Update match status (funder approves/rejects)
  updateMatchStatus: async (matchId, status, feedback = '') => {
    return api.put(`/funders/matches/${matchId}/status?status=${status}&feedback=${encodeURIComponent(feedback)}`, {});
  },

  // Get current funder's profile
  getMyProfile: async () => {
    const user = authService.getCurrentUser();
    if (user?.role === 'funder' && user?.userId) {
      return api.get(`/funders/${user.userId}`);
    }
    throw new Error('Not authenticated as funder');
  }
};