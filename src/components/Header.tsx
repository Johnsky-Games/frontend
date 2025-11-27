import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  title?: string;
  showNav?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showNav = true }) => {
  const { user, business, logout } = useAuth();
  const { theme, businessTheme } = useTheme();
  const location = useLocation();

  // Apply business theme colors if available
  React.useEffect(() => {
    if (businessTheme) {
      document.documentElement.style.setProperty('--color-primary-500', businessTheme.primary_color);
      document.documentElement.style.setProperty('--color-secondary-500', businessTheme.secondary_color);
      document.documentElement.style.setProperty('--color-accent-500', businessTheme.accent_color);
    }
  }, [businessTheme]);

  // Determine active nav item based on current location
  const isActive = (path: string) => location.pathname === path;

  // Navigation items for different user roles
  const getNavigationItems = () => {
    if (!user) return [];

    const navItems = [];

    // Role-specific dashboard route
    if (user.role === 'admin') {
      navItems.push({ name: 'Dashboard', href: '/admin/dashboard' });
      navItems.push({ name: 'Users', href: '/admin/users' });
      navItems.push({ name: 'Businesses', href: '/admin/businesses' });
      navItems.push({ name: 'Appointments', href: '/admin/appointments' });
      navItems.push({ name: 'Services', href: '/admin/services' });
      navItems.push({ name: 'Reports', href: '/admin/reports' });
      navItems.push({ name: 'Collaborators', href: '/admin/collaborators' });
    } else if (user.role === 'business_owner') {
      navItems.push({ name: 'Dashboard', href: '/business-owner/dashboard' });
      navItems.push({ name: 'Appointments', href: '/business-owner/appointments' });
      navItems.push({ name: 'Services', href: '/business-owner/services' });
      navItems.push({ name: 'Staff', href: '/business-owner/staff' });
      navItems.push({ name: 'Clients', href: '/business-owner/clients' });
      navItems.push({ name: 'Business Profile', href: '/business-profile' });
      navItems.push({ name: 'Subscription', href: '/subscription' });
    } else if (user.role === 'client') {
      navItems.push({ name: 'Dashboard', href: '/client/dashboard' });
      navItems.push({ name: 'Find Businesses', href: '/businesses' });
      navItems.push({ name: 'Appointments', href: '/client/appointments' });
      navItems.push({ name: 'Services', href: '/client/services' });
      navItems.push({ name: 'Favorites', href: '/favorites' });
      navItems.push({ name: 'Profile', href: '/client/profile' });
    }

    return navItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with logo and theme toggle */}
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              {business?.logo && user?.role === 'business_owner' && (
                <img
                  src={business.logo}
                  alt="Business Logo"
                  className="h-10 w-10 rounded-full object-cover border-2 border-primary-500"
                />
              )}
              <Link
                to={user ? (
                  user.role === 'admin' ? '/admin/dashboard' :
                    user.role === 'business_owner' ? '/business-owner/dashboard' :
                      user.role === 'client' ? '/client/dashboard' :
                        '/dashboard'
                ) : "/"}
                className="text-xl font-bold text-primary-600 dark:text-primary-400"
              >
                {business?.name && user?.role === 'business_owner' ? business.name : 'BeautySalon'}
              </Link>
            </div>

            {/* Desktop Navigation */}
            {showNav && user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`${isActive(item.href)
                      ? 'border-primary-500 text-gray-900 dark:text-gray-100'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right side - profile and logout */}
          <div className="flex items-center">
            {user && (
              <>
                <ThemeToggle />
                <div className="ml-3 relative">
                  <div>
                    <button
                      className="max-w-xs flex items-center text-sm rounded-full focus:outline-none"
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <span className="text-primary-800 dark:text-primary-200 font-medium">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            )}

            {/* Public navigation for non-authenticated users */}
            {!user && (
              <div className="flex items-center">
                <Link
                  to="/login"
                  className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {showNav && user && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`${isActive(item.href)
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;