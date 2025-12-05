import React from 'react';

interface ButtonProps {
  label: string | React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'danger';
  className?: string;
  span?: number;
}

const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'default', 
  className = '',
  span = 1
}) => {
  
  const baseStyles = "h-16 sm:h-20 rounded-2xl text-2xl font-medium transition-all duration-200 active:scale-95 flex items-center justify-center select-none shadow-lg";
  
  const variants = {
    default: "bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-600 shadow-gray-900/50",
    primary: "bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 shadow-indigo-900/50", // Operations
    secondary: "bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-500 shadow-gray-900/50", // Top row (AC, +/-)
    accent: "bg-emerald-500 text-white hover:bg-emerald-400 active:bg-emerald-600 shadow-emerald-900/50", // Equals
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  };

  const spanClass = span === 2 ? 'col-span-2' : 'col-span-1';

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${spanClass} ${className}`}
      type="button"
    >
      {label}
    </button>
  );
};

export default Button;
