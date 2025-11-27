import React from 'react';

interface CheckboxProps {
  id: string;
  label: string | React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
  className = ''
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={id}
        name={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
      />
      <label htmlFor={id} className="ml-2 block text-sm text-gray-900 cursor-pointer">
        {label}
      </label>
    </div>
  );
};

export default Checkbox;