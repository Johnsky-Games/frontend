import React from 'react';

interface FormContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

const FormContainer: React.FC<FormContainerProps> = ({
  children,
  title,
  subtitle,
  className = ''
}) => {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="w-full max-w-md space-y-8 fade-scale-in">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-bounce shadow-lg">
            <span className="text-2xl font-bold text-white">BS</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-center text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
        <div className="mt-8 bg-white py-8 px-6 shadow-xl rounded-2xl ring-1 ring-gray-900/5 transition-all duration-300 hover:shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FormContainer;