import React from 'react';

interface SpinnerIconProps {
  color?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const SpinnerIcon: React.FC<SpinnerIconProps> = ({ 
  color = '#B5BBC2', 
  size = 24, 
  strokeWidth = 2,
  className = '' 
}) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default SpinnerIcon;
