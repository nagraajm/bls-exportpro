import React from 'react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'purple-blue' | 'teal-green' | 'orange-pink' | 'indigo-violet' | 'default';
  blur?: 'sm' | 'md' | 'lg' | 'xl' | '3xl';
  animate?: boolean;
  hover?: boolean;
  glow?: boolean;
}

const variantClasses = {
  'purple-blue': 'bg-gradient-purple-blue',
  'teal-green': 'bg-gradient-teal-green',
  'orange-pink': 'bg-gradient-orange-pink',
  'indigo-violet': 'bg-gradient-indigo-violet',
  'default': ''
};

const blurClasses = {
  'sm': 'backdrop-blur-sm',
  'md': 'backdrop-blur-md',
  'lg': 'backdrop-blur-lg',
  'xl': 'backdrop-blur-xl',
  '3xl': 'backdrop-blur-3xl'
};

const glowColors = {
  'purple-blue': 'shadow-glow-purple',
  'teal-green': 'shadow-glow-green',
  'orange-pink': 'shadow-glow-blue',
  'indigo-violet': 'shadow-glow-purple',
  'default': ''
};

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  blur = 'xl',
  animate = false,
  hover = true,
  glow = false
}) => {
  const Component = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' }
  } : {};

  return (
    <Component
      className={cn(
        'relative overflow-hidden rounded-2xl',
        blurClasses[blur],
        'bg-gradient-to-br from-white/16 to-white/8 dark:from-white/16 dark:to-white/8',
        'border border-gray-200/50 dark:border-white/10',
        'shadow-lg dark:shadow-glass',
        'bg-white/80 dark:bg-gray-900/20',
        hover && 'transition-all duration-300 hover:shadow-xl dark:hover:shadow-glass-lg hover:border-gray-300/70 dark:hover:border-white/20',
        glow && variant !== 'default' && glowColors[variant],
        glow && 'animate-pulse-slow',
        className
      )}
      {...animationProps}
    >
      {/* Background gradient overlay for variant */}
      {variant !== 'default' && (
        <div className={cn(
          'absolute inset-0 opacity-5',
          variantClasses[variant]
        )} />
      )}
      
      {/* Glass shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
      
      {/* Shimmer effect on hover */}
      {hover && (
        <div className="absolute inset-0 bg-shimmer bg-[length:200%_100%] opacity-0 hover:opacity-100 transition-opacity duration-300 hover:animate-shimmer" />
      )}
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>
      
      {/* Bottom glass reflection */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </Component>
  );
};