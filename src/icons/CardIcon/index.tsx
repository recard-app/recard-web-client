import React from 'react';
import { BaseIconProps } from '../types';
import { getIconPropsForVariant } from '../index';

const CardIcon: React.FC<BaseIconProps> = ({ 
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

  // Render solid card icon (24x24)
  const renderSolidIcon = () => (
    <>
      <path d="M4.5 3.75a3 3 0 0 0-3 3v.75h21v-.75a3 3 0 0 0-3-3h-15Z" />
      <path fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-7.5Zm-18 3.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clipRule="evenodd" />
    </>
  );

  // Render outline card icon (24x24)
  const renderOutlineIcon = () => (
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" 
    />
  );

  // Render mini card icon (20x20)
  const renderMiniIcon = () => (
    <path 
      fillRule="evenodd" 
      d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" 
      clipRule="evenodd" 
    />
  );

  // Render micro card icon (16x16)
  const renderMicroIcon = () => (
    <>
      <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5V5h14v-.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
      <path fillRule="evenodd" d="M15 7H1v4.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V7ZM3 10.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75Zm3.75-.75a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z" clipRule="evenodd" />
    </>
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

export default CardIcon;
