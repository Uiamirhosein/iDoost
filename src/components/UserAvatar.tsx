import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  border?: boolean;
}

const sizeClasses = {
  xs: 'w-4 h-4 text-[9px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-11 h-11 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

// Generates consistent elegant gradient based on user name
function getGradient(name: string = '') {
  const gradients = [
    'from-purple-600 to-indigo-600',
    'from-pink-600 to-rose-600',
    'from-emerald-600 to-teal-600',
    'from-amber-600 to-orange-600',
    'from-cyan-600 to-blue-600',
    'from-violet-600 to-purple-800',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export const UserAvatar: React.FC<AvatarProps> = ({
  src,
  name = 'کاربر',
  size = 'md',
  className = '',
  border = true,
}) => {
  const [hasError, setHasError] = React.useState(false);

  // Check if src is valid and not a placeholder Unsplash URL
  const isValidUrl = src && src.trim() !== '' && !src.includes('unsplash.com') && !hasError;
  const initialLetter = name ? name.trim().charAt(0) : '';

  return (
    <div
      className={`relative rounded-2xl overflow-hidden shrink-0 flex items-center justify-center font-bold text-white shadow-inner select-none ${
        sizeClasses[size]
      } ${border ? 'border border-white/10' : ''} ${className}`}
    >
      {isValidUrl ? (
        <img
          src={src}
          alt={name}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className={`w-full h-full bg-gradient-to-tr ${getGradient(
            name
          )} flex items-center justify-center`}
        >
          {initialLetter ? (
            <span>{initialLetter}</span>
          ) : (
            <User className="w-1/2 h-1/2 opacity-80" />
          )}
        </div>
      )}
    </div>
  );
};
