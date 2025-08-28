import React from 'react';
import { cn } from '../../utils/cn';

interface StatusBadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'default' | 'active' | 'pending' | 'completed' | 'failed' | 'inactive';
  status?: 'active' | 'pending' | 'completed' | 'failed' | 'warning' | 'inactive';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const statusStyles = {
  success: {
    bg: 'bg-gradient-to-r from-emerald-400 to-green-600',
    text: 'text-white',
    glow: 'shadow-emerald-500/50'
  },
  active: {
    bg: 'bg-gradient-to-r from-emerald-400 to-green-600',
    text: 'text-white',
    glow: 'shadow-emerald-500/50'
  },
  warning: {
    bg: 'bg-gradient-to-r from-amber-400 to-orange-600',
    text: 'text-white',
    glow: 'shadow-amber-500/50'
  },
  pending: {
    bg: 'bg-gradient-to-r from-amber-400 to-orange-600',
    text: 'text-white',
    glow: 'shadow-amber-500/50'
  },
  error: {
    bg: 'bg-gradient-to-r from-red-400 to-rose-600',
    text: 'text-white',
    glow: 'shadow-red-500/50'
  },
  failed: {
    bg: 'bg-gradient-to-r from-red-400 to-rose-600',
    text: 'text-white',
    glow: 'shadow-red-500/50'
  },
  completed: {
    bg: 'bg-gradient-to-r from-blue-400 to-indigo-600',
    text: 'text-white',
    glow: 'shadow-blue-500/50'
  },
  default: {
    bg: 'bg-gradient-to-r from-gray-500 to-gray-700',
    text: 'text-white',
    glow: 'shadow-gray-500/50'
  },
  inactive: {
    bg: 'bg-gradient-to-r from-gray-500 to-gray-700',
    text: 'text-white',
    glow: 'shadow-gray-500/50'
  }
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base'
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  variant,
  status, 
  label, 
  size = 'md',
  animated = false,
  icon,
  children
}) => {
  const currentStatus = variant || status || 'default';
  const styles = statusStyles[currentStatus as keyof typeof statusStyles] ?? statusStyles.default;
  
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        styles.bg,
        styles.text,
        sizeStyles[size],
        animated && 'animate-pulse',
        'shadow-lg',
        styles.glow
      )}
    >
      {animated && (
        <span className="absolute inset-0 rounded-full animate-ping opacity-20" 
              style={{ background: 'inherit' }} />
      )}
      <span className="relative flex items-center space-x-1">
        {icon && <span className="flex items-center">{icon}</span>}
        <span>
          {children || label || currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
        </span>
      </span>
    </span>
  );
};