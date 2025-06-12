import React from 'react';
import { BaseIconProps } from '../types';
import { getIconPropsForVariant } from '../index';

const AccountIcon: React.FC<BaseIconProps> = ({ 
  variant = 'solid',
  color = '#22CC9D', // $primary-color from variables.scss
  size = 24,
  className = '',
  ...props
}) => {
  // Use the centralized utility function for variant-based sizing
  const { viewBox, defaultSize } = getIconPropsForVariant(variant);
  const finalSize = size || defaultSize;
  const fillColor = variant === 'outline' ? 'none' : 'currentColor';
  const strokeColor = variant === 'outline' ? 'currentColor' : 'none';

  // Render solid account icon (24x24)
  const renderSolidIcon = () => (
    <path 
      fillRule="evenodd" 
      d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" 
      clipRule="evenodd" 
    />
  );

  // Render outline account icon (24x24)
  const renderOutlineIcon = () => (
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" 
    />
  );

  // Render mini account icon (20x20)
  const renderMiniIcon = () => (
    <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
  );

  // Render micro account icon (16x16)
  const renderMicroIcon = () => (
    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
  );

  const renderIcon = () => {
    switch (variant) {
      case 'solid':
        return renderSolidIcon();
      case 'outline':
        return renderOutlineIcon();
      case 'mini':
        return renderMiniIcon();
      case 'micro':
        return renderMicroIcon();
      default:
        return renderSolidIcon();
    }
  };

  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={finalSize}
      height={finalSize}
      viewBox={viewBox}
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={variant === 'outline' ? 1.5 : undefined}
      style={{ color }}
      {...props}
    >
      {renderIcon()}
    </svg>
  );
};

export default AccountIcon;
