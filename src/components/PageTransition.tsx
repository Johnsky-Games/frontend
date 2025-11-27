import React from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();

  // Simple transition without framer-motion to avoid type issues
  return (
    <div
      key={location.pathname}
      className="transition-all duration-200 ease-in-out"
    >
      {children}
    </div>
  );
};

export default PageTransition;