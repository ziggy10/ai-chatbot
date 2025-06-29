import React from 'react';

interface AnimatedSendIconProps {
  className?: string;
}

export const AnimatedSendIcon: React.FC<AnimatedSendIconProps> = ({ className }) => {
  return (
    <div className={`inline-block ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full transition-transform duration-300 hover:translate-x-1"
      >
        <path d="m3 3 3 9-3 9 19-9Z" />
        <path d="m6 12 15 0" />
      </svg>
    </div>
  );
};