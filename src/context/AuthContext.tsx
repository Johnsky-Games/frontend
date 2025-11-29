import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/ApiService';

// Helper function to save business theme
const saveBusinessTheme = (business: any) => {
  if (business && business.primary_color) {
    const themeData = {
      primary_color: business.primary_color,
      secondary_color: business.secondary_color,
      accent_color: business.accent_color,
      theme_mode: business.theme_mode
    };
    localStorage.setItem('businessTheme', JSON.stringify(themeData));
    // Trigger a storage event to notify ThemeContext
    window.dispatchEvent(new Event('business-theme-updated'));
  }
};

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  business_id: number | null;
  phone: string | null;
  avatar: string | null;
  created_at: string;
  admin_role?: 'super_admin' | 'admin' | 'moderator' | 'support' | null;
  permissions?: string[] | null;
  is_admin_collaborator?: boolean;
}

interface Business {
  id: number;
  owner_id: number;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zip_code: string | null;
  phone: string | null;
  email: string | null;
  logo: string | null;
  cover_image: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  theme_mode: string;
  timezone: string;
  currency: string;
  business_hours: any;
  special_hours: any;
  is_active: boolean;
  is_verified: boolean;
  verification_requested: boolean;
  verification_notes: string | null;
  verified_by: number | null;
  verified_at: string | null;
  verification_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  whatsapp_number: string | null;
  website_url: string | null;
  map_url: string | null;
  latitude: string | null;
  longitude: string | null;
  average_rating: string | number | null;
  rating_count: number | null;
}

export interface AuthContextType {
  user: User | null;
  business: Business | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  register: (
    name: string,
    email: string,
    password: string,
    role?: string,
    business_id?: number
  ) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshBusiness: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch user data from backend
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data) {
        const { user, business } = response.data;
        setUser(user);
        if (business) {
          setBusiness(business);
          saveBusinessTheme(business);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // Clear invalid token and business theme
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('businessData');
      localStorage.removeItem('businessTheme');
      window.dispatchEvent(new Event('business-theme-updated'));
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      // Check if login was successful based on the code
      if (response.data.code === 'LOGIN_SUCCESS') {
        const { user, business, token } = response.data;

        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(user));
        if (business) {
          localStorage.setItem('businessData', JSON.stringify(business));
        }

        setUser(user);
        setBusiness(business || null);

        // Apply business theme if available
        if (business) {
          saveBusinessTheme(business);
        }

        // navigate('/dashboard'); // Removed to let caller handle navigation

        return response.data; // Return data so caller can check for warnings
      } else if (response.data.code === 'PASSWORD_CHANGE_REQUIRED') {
        // This is a special case where we want to return the data to the caller
        // so they can handle the forced password change flow.
        // We do NOT set user/token in context yet because they are not fully logged in.
        return response.data;
      } else {
        // Handle case where response doesn't have LOGIN_SUCCESS code but still has 200 status
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response) {
        const { data, status } = error.response;

        // Handle the new structured error codes from backend
        if (data.code) {
          switch (data.code) {
            case 'INVALID_CREDENTIALS':
              throw new Error(data.message || 'Invalid email or password');
            case 'USER_NOT_VERIFIED':
              throw new Error(data.message || 'Your account is not verified. Please check your email.');
            case 'ACCOUNT_INACTIVE':
              throw new Error(data.message || 'Your account is inactive.');
            case 'MISSING_FIELDS':
              throw new Error(data.message || 'Email and password are required');
            case 'VALIDATION_ERROR':
              // Format validation error details
              let validationMessage = data.message || 'Validation failed';
              if (data.details && Array.isArray(data.details)) {
                validationMessage += ': ' + data.details.map((detail: { message: string }) => detail.message).join(', ');
              }
              throw new Error(validationMessage);
            default:
              throw new Error(data.message || 'Login failed');
          }
        } else if (typeof data === 'string') {
          // For rate limit or other string responses
          throw new Error(data);
        } else if (status === 429) {
          throw new Error('Too many login attempts. Please wait before trying again.');
        } else {
          // Generic error when no code is provided
          throw new Error(data.error || data.message || 'Login failed');
        }
      } else if (error.request) {
        // Network error - no response received
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        // Other error (e.g., setting up request)
        throw new Error('An error occurred. Please try again.');
      }
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: string = 'client',
    business_id?: number
  ) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        business_id
      });

      const { user, business, token } = response.data;

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(user));
      if (business) {
        localStorage.setItem('businessData', JSON.stringify(business));
      }

      setUser(user);
      setBusiness(business || null);

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response && error.response.data) {
        throw new Error(error.response.data.error || 'Registration failed');
      }
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setBusiness(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('businessData');

    // Clear business theme and reset to default
    localStorage.removeItem('businessTheme');
    window.dispatchEvent(new Event('business-theme-updated'));

    navigate('/login');
  };

  // Update user profile
  const updateUser = async (userData: Partial<User>) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await api.put('/auth/profile', userData);

      if (response.data.code === 'PROFILE_UPDATED') {
        const updatedUser = response.data.user;
        setUser(updatedUser);

        // Update local storage as well
        localStorage.setItem('userData', JSON.stringify(updatedUser));

        return updatedUser;
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  // Refresh business data
  const refreshBusiness = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data && response.data.business) {
        setBusiness(response.data.business);
        localStorage.setItem('businessData', JSON.stringify(response.data.business));
      }
    } catch (error) {
      console.error('Failed to refresh business data:', error);
    }
  };

  const value = {
    user,
    business,
    login,
    logout,
    register,
    updateUser,
    refreshBusiness,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};