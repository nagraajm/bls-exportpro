import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import { GlassCard } from './GlassCard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  prefix?: string;
  suffix?: string;
  variant?: 'purple-blue' | 'teal-green' | 'orange-pink' | 'indigo-violet';
  animate?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  prefix = '',
  suffix = '',
  variant = 'purple-blue',
  animate = true
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.-]/g, ''));

  useEffect(() => {
    if (animate && typeof value === 'number') {
      const duration = 1500;
      const steps = 60;
      const increment = numericValue / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setDisplayValue(numericValue);
          clearInterval(timer);
        } else {
          setDisplayValue(current);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(numericValue);
    }
  }, [value, numericValue, animate]);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400';

  return (
    <GlassCard variant={variant} animate={animate} className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              {prefix}
              {animate && typeof value === 'number' 
                ? displayValue.toLocaleString(undefined, { maximumFractionDigits: 0 })
                : value
              }
              {suffix}
            </h3>
            {change !== undefined && (
              <div className={cn('flex items-center text-sm', trendColor)}>
                <TrendIcon className="w-4 h-4 mr-1" />
                <span>{Math.abs(change)}%</span>
              </div>
            )}
          </div>
        </div>
        {icon && (
          <div className="p-3 rounded-lg bg-gray-100/50 dark:bg-white/10 backdrop-blur-sm">
            {icon}
          </div>
        )}
      </div>
      
      {/* Static gradient overlay - removed animation to prevent flickering */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none" />
    </GlassCard>
  );
};