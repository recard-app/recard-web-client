import React from 'react';
import { BaseIconProps } from '../types';
import { getIconPropsForVariant } from '../index';

const HomeIcon: React.FC<BaseIconProps> = ({ 
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

  // Render solid home icon (24x24)
  const renderSolidIcon = () => (
    <>
      <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
      <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
    </>
  );

  // Render outline home icon (24x24)
  const renderOutlineIcon = () => (
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" 
    />
  );

  // Render mini home icon (20x20)
  const renderMiniIcon = () => (
    <path 
      fillRule="evenodd" 
      d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" 
      clipRule="evenodd" 
    />
  );

  // Render micro home icon (16x16)
  const renderMicroIcon = () => (
    <path d="M8.543 2.232a.75.75 0 0 0-1.085 0l-5.25 5.5A.75.75 0 0 0 2.75 9H4v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V9h1.25a.75.75 0 0 0 .543-1.268l-5.25-5.5Z" />
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

export default HomeIcon;