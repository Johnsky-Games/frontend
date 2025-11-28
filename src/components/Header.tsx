import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import UserAvatar from './UserAvatar';
import { Menu, X, ChevronDown } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showNav?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showNav = true }) => {
  const { user, business, logout } = useAuth();
  const { theme, businessTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close More menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Split items for desktop view (show 5, hide rest)
  const VISIBLE_ITEMS_COUNT = 5;
  const visibleNavItems = navigationItems.slice(0, VISIBLE_ITEMS_COUNT);
  const overflowNavItems = navigationItems.slice(VISIBLE_ITEMS_COUNT);

  return (
    <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-50 transition-colors duration-200">
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
                className="text-xl font-bold text-primary-600 dark:text-primary-400 whitespace-nowrap"
              >
                {business?.name && user?.role === 'business_owner' ? business.name : 'BeautySalon'}
              </Link>
            </div>

            {/* Desktop Navigation - Standard + More Dropdown */}
            {showNav && user && (
              <div className="hidden lg:ml-6 lg:flex lg:space-x-8">
                {visibleNavItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`${isActive(item.href)
                      ? 'border-primary-500 text-gray-900 dark:text-gray-100'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* "More" Dropdown for overflow items */}
                {overflowNavItems.length > 0 && (
                  <div className="relative flex items-center" ref={moreMenuRef}>
                    <button
                      onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                      className={`border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 focus:outline-none ${isMoreMenuOpen ? 'text-gray-900 dark:text-gray-100' : ''}`}
                    >
                      More <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isMoreMenuOpen ? 'transform rotate-180' : ''}`} />
                    </button>

                    {isMoreMenuOpen && (
                      <div className="absolute top-full right-0 left-0 mt-1 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-100">
                        {overflowNavItems.map((item) => (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setIsMoreMenuOpen(false)}
                            className={`${isActive(item.href)
                              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
                              } block px-4 py-2 text-sm transition-colors duration-150`}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side - profile and logout */}
          <div className="flex items-center flex-shrink-0 ml-4">
            {user && (
              <>
                <ThemeToggle />
                <div className="ml-3 relative hidden sm:block">
                  <div>
                    <button
                      className="max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <span className="sr-only">Open user menu</span>
                      <UserAvatar
                        name={user.name}
                        avatar={user.avatar}
                        size="sm"
                      />
                    </button>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 hidden sm:block transition-colors duration-200"
                >
                  Logout
                </button>

                {/* Mobile menu button (Visible up to LG) */}
                <div className="flex items-center lg:hidden ml-4">
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors duration-200"
                  >
                    <span className="sr-only">Open main menu</span>
                    {isMobileMenuOpen ? (
                      <X className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Menu className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Public navigation for non-authenticated users */}
            {!user && (
              <div className="flex items-center">
                <Link
                  to="/login"
                  className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showNav && user && isMobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 absolute w-full shadow-lg z-50 left-0 right-0">
            <div className="pt-2 pb-3 space-y-1 px-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${isActive(item.href)
                    ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                    } block pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-colors duration-200 rounded-r-md`}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Profile Section */}
              <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700 mt-4">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <UserAvatar
                      name={user.name}
                      avatar={user.avatar}
                      size="md"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800 dark:text-gray-200">{user.name}</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:text-red-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;