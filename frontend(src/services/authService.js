// src/services/authService.js
import { api } from './api';

export const authService = {
  // Register new user
  register: async (userData) => {
    // Map frontend field names to backend expected field names
    const backendData = {
      fullName: userData.fullName,  // Note: fullName not full_name
      email: userData.email,
      password: userData.password,
      role: userData.role,
      phone: userData.phone || '',
    };

    // Add role-specific fields based on what your backend expects
    if (userData.role === 'entrepreneur') {
      backendData.businessName = userData.businessName;
      backendData.industry = userData.industry;
      backendData.cicpNumber = userData.cicpNumber;
    } else if (userData.role === 'funder') {
      backendData.organizationName = userData.organizationName;
      backendData.investmentBudget = userData.investmentBudget ? parseFloat(userData.investmentBudget) : null;
      backendData.preferredIndustry = userData.preferredIndustry;
      backendData.minimumReadinessScore = parseInt(userData.minimumReadinessScore) || 0;
      backendData.requirements = userData.requirements || {};
    }
    // Mentors don't need additional fields
    
    console.log('Sending to backend:', backendData); // Debug log
    
    const response = await api.post('/auth/register', backendData);
    return response;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    
    console.log('Login response:', response); // Debug log
    
    // Store token and user data in localStorage
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.user.id,
        fullName: response.user.fullName,
        email: response.user.email,
        role: response.user.role
      }));
    }
    
    return response;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get auth token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Get user role
  getUserRole: () => {
    const user = authService.getCurrentUser();
    return user?.role || null;
  }
};