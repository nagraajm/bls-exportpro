import React from 'react';
import { cn } from '../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className = '',
  children,
  disabled,
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/50 shadow-lg hover:shadow-xl',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary/50 shadow-lg hover:shadow-xl',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl',
    outline: 'border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 focus:ring-gray-400 dark:focus:ring-white/50 backdrop-blur-sm',
    glass: 'bg-gray-100/80 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-200/80 dark:hover:bg-white/20 focus:ring-gray-400 dark:focus:ring-white/50 shadow-lg dark:shadow-glass hover:shadow-xl dark:hover:shadow-glass-lg'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;