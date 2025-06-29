import React from 'react';

interface AnimatedBotIconProps {
  className?: string;
}

export const AnimatedBotIcon: React.FC<AnimatedBotIconProps> = ({ className }) => {
  return (
    <div className={`inline-block ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full transition-transform duration-300 hover:scale-110 hover:animate-pulse"
      >
        <path d="M12 8V4H8" />
        <rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M2 14h2" />
        <path d="M20 14h2" />
        <path d="M15 13v2" />
        <path d="M9 13v2" />
      </svg>
    </div>
  );
};