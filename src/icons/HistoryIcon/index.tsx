import React from 'react';
import { BaseIconProps } from '../types';
import { getIconPropsForVariant } from '../index';

const HistoryIcon: React.FC<BaseIconProps> = ({ 
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

  // Render solid history icon (24x24)
  const renderSolidIcon = () => (
    <path 
      fillRule="evenodd" 
      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" 
      clipRule="evenodd" 
    />
  );

  // Render outline history icon (24x24)
  const renderOutlineIcon = () => (
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" 
    />
  );

  // Render mini history icon (20x20)
  const renderMiniIcon = () => (
    <path 
      fillRule="evenodd" 
      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" 
      clipRule="evenodd" 
    />
  );

  // Render micro history icon (16x16)
  const renderMicroIcon = () => (
    <path 
      fillRule="evenodd" 
      d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z" 
      clipRule="evenodd" 
    />
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

export default HistoryIcon;
