import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isValid?: boolean;
  helperText?: string;
  icon?: React.ReactNode;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  isValid,
  helperText,
  icon,
  className = '',
  ...props
}) => {
  // Determine border color based on validation state
  let borderColor = 'border-gray-300';
  let focusRingColor = 'focus:ring-indigo-500 focus:border-indigo-500';

  if (error) {
    borderColor = 'border-red-500';
    focusRingColor = 'focus:ring-red-500 focus:border-red-500';
  } else if (isValid === true) {
    borderColor = 'border-green-500';
    focusRingColor = 'focus:ring-green-500 focus:border-green-500';
  }

  return (
    <div className="mb-5">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`
            focus:ring-2 ${focusRingColor} focus:border-current block w-full pl-10 pr-3 py-3 ${borderColor} rounded-lg transition duration-300 ease-in-out
            ${icon ? 'pl-10' : 'pl-3'}
            ${className}
          `}
        />
      </div>
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;