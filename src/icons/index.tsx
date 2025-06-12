import React from 'react';
import { IconVariant } from './types';
import HomeIcon from './HomeIcon';

// Icon components
export { default as HomeIcon } from './HomeIcon';
export { default as SpinnerIcon } from './SpinnerIcon';
export { default as HistoryIcon } from './HistoryIcon';
export { default as CardIcon } from './CardIcon';
export { default as SignOutIcon } from './SignOutIcon';
export { default as AccountIcon } from './AccountIcon';
export { default as PreferencesIcon } from './PreferencesIcon';
export { default as SidebarIcon } from './SidebarIcon';

// Types
export type { BaseIconProps, IconVariant, IconComponentProps } from './types';

// Utility function to get icon properties based on variant
export const getIconPropsForVariant = (variant: IconVariant = 'solid') => {
  switch (variant) {
    case 'mini':
      return { viewBox: '0 0 20 20', defaultSize: 20 };
    case 'micro':
      return { viewBox: '0 0 16 16', defaultSize: 16 };
    default:
      return { viewBox: '0 0 24 24', defaultSize: 24 };
  }
};

// Generic icon variant factory function for creating pre-configured icon components
export const createIconVariant = <T extends React.ComponentType<any>>(
  IconComponent: T,
  variant?: IconVariant,
  defaultColor?: string
) => 
  ({ color, size, className, ...otherProps }: { 
    color?: string; 
    size?: number | string; 
    className?: string; 
    [key: string]: any; 
  } = {}) => React.createElement(IconComponent, { 
    variant, 
    color: color || defaultColor, 
    size, 
    className, 
    ...otherProps 
  });

// Specific HomeIcon variant factory (backward compatibility)
export const createHomeIconVariant = (variant: 'solid' | 'outline' | 'mini' | 'micro', defaultColor?: string) => 
  createIconVariant(HomeIcon, variant, defaultColor);

// Generic helper to create icon variant objects
export const createIconVariants = <T extends React.ComponentType<any>>(
  IconComponent: T,
  variants: {
    [key: string]: {
      variant?: IconVariant;
      color?: string;
    }
  }
) => {
  const result: { [key: string]: ReturnType<typeof createIconVariant> } = {};
  
  Object.entries(variants).forEach(([key, config]) => {
    result[key] = createIconVariant(IconComponent, config.variant, config.color);
  });
  
  return result;
};

// Centralized IconRenderer for reuse across components
export const IconRenderer: React.FC<{ 
  icon: string | React.ComponentType<any>; 
  alt: string; 
  className?: string;
  size?: number | string;
  color?: string;
  variant?: IconVariant;
}> = ({ icon, alt, className = "", size, color, variant, ...props }) => {
  if (typeof icon === 'string') {
    return <img src={icon} alt={alt} className={className} />;
  } else {
    return React.createElement(icon, { 
      className,
      size,
      color,
      variant,
      'aria-label': alt,
      ...props
    });
  }
};

// Re-export everything for convenience
export * from './HomeIcon';
export * from './SpinnerIcon';
export * from './HistoryIcon';
export * from './CardIcon';
export * from './SignOutIcon';
export * from './AccountIcon';
export * from './PreferencesIcon';
export * from './SidebarIcon';
