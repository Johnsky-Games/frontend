import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  onClick
}) => {
  const baseClasses = 'card-animated bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700';
  const hoverClasses = hoverEffect ? 'hover:shadow-lg transform transition-all duration-300' : '';
  
  const classes = `${baseClasses} ${hoverClasses} ${className}`;

  return (
    <div 
      className={classes}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;