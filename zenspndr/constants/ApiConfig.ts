// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__ ? 'http://192.168.0.103:3000' : 'https://your-production-url.com',
  ENDPOINTS: {
    TRANSACTIONS: '/api/transactions',
  },
  TIMEOUT: 10000, // 10 seconds
};

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Network utility functions
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.error || error.response.data?.message || 'Server error';
  } else if (error.request) {
    // Request was made but no response
    return 'Network error - please check your connection';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};

export const createApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
