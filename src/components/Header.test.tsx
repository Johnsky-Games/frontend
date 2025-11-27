import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Header from './Header';

// Create a test wrapper that allows us to mock the auth context
const AuthTestProvider: React.FC<{ children: React.ReactNode; user?: any, business?: any }> = ({
  children,
  user = null,
  business = null
}) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

// Mock the useAuth hook
jest.mock('../context/AuthContext', () => ({
  ...jest.requireActual('../context/AuthContext'),
  useAuth: jest.fn()
}));

describe('Header Component', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReset();
  });

  test('renders public navigation when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      business: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      loading: false,
      isAuthenticated: false
    });

    render(
      <MemoryRouter>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  test('renders authenticated navigation when user is logged in', () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'client',
      business_id: null,
      phone: null,
      avatar: null,
      created_at: new Date().toISOString()
    };

    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      business: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      loading: false,
      isAuthenticated: true
    });

    render(
      <MemoryRouter>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Appointments')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('renders business owner navigation', () => {
    const mockUser = {
      id: 1,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'business_owner',
      business_id: 1,
      phone: null,
      avatar: null,
      created_at: new Date().toISOString()
    };

    const mockBusiness = {
      id: 1,
      owner_id: 1,
      name: "Jane's Business",
      description: 'Default business description',
      primary_color: '#3B82F6',
      secondary_color: '#10B981',
      accent_color: '#8B5CF6',
      theme_mode: 'light',
      // Add other required properties
      address: null,
      city: null,
      state: null,
      country: null,
      zip_code: null,
      phone: null,
      email: null,
      logo: null,
      cover_image: null,
      timezone: 'UTC',
      currency: 'USD',
      business_hours: {},
      special_hours: {},
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      business: mockBusiness,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      loading: false,
      isAuthenticated: true
    });

    render(
      <MemoryRouter>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Business Profile')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  test('renders admin navigation', () => {
    const mockUser = {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      business_id: null,
      phone: null,
      avatar: null,
      created_at: new Date().toISOString()
    };

    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      business: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      loading: false,
      isAuthenticated: true
    });

    render(
      <MemoryRouter>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('User Management')).toBeInTheDocument();
  });
});