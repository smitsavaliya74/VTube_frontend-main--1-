import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const fetchUser = async () => {
      try {
        const response = await api.get('/users/current-user');
        setCurrentUser(response.data.data);
      } catch (error) {
        console.log('No user currently logged in');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      console.log('Session expired. Logging out.');
      setCurrentUser(null);
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  const login = async (identifier, password) => {
    try {
      const isEmail = identifier.includes('@');
      const payload = isEmail 
        ? { email: identifier, password } 
        : { username: identifier, password };
        
      const response = await api.post('/users/login', payload);
      setCurrentUser(response.data.data.user);
      return response.data;
    } catch (error) {
      console.error('Login API Error:', error);
      const status = error.response?.status;
      
      let errMsg = 'Login failed';
      if (!error.response) {
        errMsg = 'Network Error: Backend is down or crashed!';
      } else if (error.response?.data?.message) {
        errMsg = error.response.data.message;
      } else if (status === 403) {
        errMsg = 'Please verify your email first';
      } else if (status === 401) {
        errMsg = 'Invalid credentials';
      } else if (status === 404) {
        errMsg = 'User not found';
      } else if (status === 429) {
        errMsg = 'Too many login attempts. Please wait 15 minutes.';
      } else if (status === 400) {
        errMsg = 'Bad Request: Please check your email or password formatting.';
      } else if (status >= 500) {
        errMsg = 'Internal Server Error (Check Backend Terminal)';
      }

      throw { message: errMsg, status };
    }
  };

  const register = async (formData) => {
    try {
      const response = await api.post('/users/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Registration API Error:', error);
      throw error.response?.data?.message || error.message || 'Registration failed';
    }
  };

  const verifyEmail = async (email, otp) => {
    try {
      const response = await api.post('/users/verify-email', { email, otp });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Verification failed';
    }
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  // Call this after updating profile details so Navbar reflects changes immediately
  const refreshUser = async () => {
    try {
      const response = await api.get('/users/current-user');
      setCurrentUser(response.data.data);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    verifyEmail,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

