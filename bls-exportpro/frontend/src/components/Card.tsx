import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`glass rounded-lg p-6 gradient-shadow ${className}`}>
      {title && (
        <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
      )}
      {children}
    </div>
  );
};

export default Card;
export { Card };