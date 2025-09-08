import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg dark:shadow-none border border-light-border dark:border-dark-border ${className}`}>
      {title && (
        <h2 className="text-xl font-semibold mb-4 text-light-heading dark:text-dark-heading">{title}</h2>
      )}
      {children}
    </div>
  );
};

export default Card;
export { Card };