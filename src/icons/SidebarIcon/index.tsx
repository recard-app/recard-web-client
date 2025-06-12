import React from 'react';

export type SidebarIconVariant = 'open' | 'close';

export interface SidebarIconProps {
  variant?: SidebarIconVariant;
  color?: string;
  size?: number | string;
  className?: string;
}

const SidebarIcon: React.FC<SidebarIconProps & Omit<React.SVGProps<SVGSVGElement>, 'color'>> = ({ 
  variant = 'close',
  color = '#22CC9D', // $primary-color from variables.scss
  size = 24,
  className = '',
  ...props
}) => {
  const finalSize = size || 24;

  // Render open sidebar icon (panel left open)
  const renderOpenIcon = () => (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2"/>
      <path d="M9 3v18"/>
      <path d="m14 9 3 3-3 3"/>
    </>
  );

  // Render close sidebar icon (panel left close)
  const renderCloseIcon = () => (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2"/>
      <path d="M9 3v18"/>
      <path d="m16 15-3-3 3-3"/>
    </>
  );

  const renderIcon = () => {
    switch (variant) {
      case 'open':
        return renderOpenIcon();
      case 'close':
        return renderCloseIcon();
      default:
        return renderCloseIcon();
    }
  };

  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={finalSize}
      height={finalSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color }}
      {...props}
    >
      {renderIcon()}
    </svg>
  );
};

export default SidebarIcon;
