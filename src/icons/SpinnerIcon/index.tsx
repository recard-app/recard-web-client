import React from 'react';
import { BaseIconProps } from '../types';

const SpinnerIcon: React.FC<BaseIconProps> = ({ 
  variant = 'solid', // Accept but ignore variant
  color = '#B5BBC2', // $primary-color from variables.scss
  size = 24,
  className = '',
  ...props
}) => {
  // Always use the same version regardless of variant
  const finalSize = size || 24;

  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width={finalSize}
      height={finalSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};

export default SpinnerIcon;
