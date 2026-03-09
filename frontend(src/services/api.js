// src/services/api.js

const API_BASE_URL = 'http://localhost:5000/api';

// Helper to handle responses
const handleResponse = async (response) => {
  // Check if response is empty (204 No Content)
  if (response.status === 204) {
    return {};
  }
  
  let data;
  try {
    data = await response.json();
  } catch (error) {
    // If response is not JSON, use empty object
    console.warn('Response is not JSON:', error.message);
    data = {};
  }
  
  if (!response.ok) {
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      data: data
    });
    
    // Handle specific error cases
    if (response.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    
    if (response.status === 400) {
      // Handle validation errors from express-validator
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors.map(err => err.msg).join(', ');
        throw new Error(errorMessages);
      }
      if (data.error) {
        throw new Error(data.error);
      }
      throw new Error('Bad request. Please check your input.');
    }
    
    if (response.status === 403) {
      throw new Error('You do not have permission to perform this action.');
    }
    
    if (response.status === 404) {
      throw new Error('Resource not found.');
    }
    
    if (response.status === 409) {
      throw new Error(data.error || 'User already exists');
    }
    
    if (response.status === 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    // Use error message from backend
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }
  return data;
};

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const api = {
  // GET request
  get: async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Network error:', error);
      throw new Error('Network error. Please check your connection.');
    }
  },

  // POST request
  post: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Network error:', error);
      throw new Error('Network error. Please check your connection.');
    }
  },

  // PUT request
  put: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Network error:', error);
      throw new Error('Network error. Please check your connection.');
    }
  },

  // DELETE request
  delete: async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Network error:', error);
      throw new Error('Network error. Please check your connection.');
    }
  }
};