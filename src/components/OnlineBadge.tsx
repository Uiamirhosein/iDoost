import React from 'react';

interface OnlineBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  borderColor?: string;
}

export const OnlineBadge: React.FC<OnlineBadgeProps> = ({
  size = 'md',
  className = '',
  borderColor = 'border-[#10111a]',
}) => {
  const dotDimensions = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const pingDimensions = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      <span
        className={`absolute inline-flex ${pingDimensions[size]} rounded-full bg-emerald-400/80 animate-ping`}
      />
      <span
        className={`relative inline-flex ${dotDimensions[size]} rounded-full bg-emerald-500 border-2 ${borderColor} shadow-[0_0_10px_rgba(16,185,129,0.8)]`}
      />
    </span>
  );
};
