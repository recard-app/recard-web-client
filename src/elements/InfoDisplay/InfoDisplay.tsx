import React from 'react';
import './InfoDisplay.scss';
import { INFO_COLORS, INFO_ICONS, INFO_TITLES, LOADING_ICON, LOADING_ICON_SIZE } from '../../types/Constants';
import { IconRenderer } from '../../icons';

interface InfoDisplayProps {
  type?: 'default' | 'error' | 'info' | 'warning' | 'success' | 'loading';
  icon?: string | React.ComponentType<any> | ((...args: any[]) => React.ReactElement);
  title?: string;
  message: string;
  color?: string;
  showTitle?: boolean;
  transparent?: boolean;
  showIcon?: boolean;
  centered?: boolean;
}

export const InfoDisplay: React.FC<InfoDisplayProps> = ({
  type,
  icon,
  title,
  message,
  color,
  showTitle = true,
  transparent = false,
  showIcon = true,
  centered = false
}) => {
  // Default values based on type
  const getDefaultValues = () => {
    switch (type) {
      case 'default':
        return {
          defaultTitle: INFO_TITLES.DEFAULT,
          defaultColor: INFO_COLORS.DEFAULT,
          defaultIcon: INFO_ICONS.DEFAULT
        };
      case 'error':
        return {
          defaultTitle: INFO_TITLES.ERROR,
          defaultColor: INFO_COLORS.ERROR,
          defaultIcon: INFO_ICONS.ERROR
        };
      case 'warning':
        return {
          defaultTitle: INFO_TITLES.WARNING,
          defaultColor: INFO_COLORS.WARNING,
          defaultIcon: INFO_ICONS.WARNING
        };
      case 'success':
        return {
          defaultTitle: INFO_TITLES.SUCCESS,
          defaultColor: INFO_COLORS.SUCCESS,
          defaultIcon: INFO_ICONS.SUCCESS
        };
      case 'loading':
        return {
          defaultTitle: INFO_TITLES.LOADING,
          defaultColor: INFO_COLORS.LOADING,
          defaultIcon: INFO_ICONS.LOADING
        };
      case 'info':
      default:
        return {
          defaultTitle: INFO_TITLES.INFO,
          defaultColor: INFO_COLORS.INFO,
          defaultIcon: INFO_ICONS.INFO
        };
    }
  };

  const { defaultTitle, defaultColor, defaultIcon } = getDefaultValues();

  // Use provided values or fall back to defaults
  const displayTitle = title || defaultTitle;
  const displayColor = color || defaultColor;
  const displayIcon = icon || defaultIcon;
  
  // Create background color with 0.1 opacity
  const getBackgroundColor = (hexColor: string) => {
    // If transparent is true, return transparent background
    if (transparent) {
      return 'transparent';
    }
    
    // Convert hex to rgba with 0.1 opacity
    if (hexColor.startsWith('#')) {
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return hexColor; // Fallback if not hex
  };

  return (
    <div 
      className={`info-component ${centered ? 'centered' : ''}`}
      style={{ 
        backgroundColor: getBackgroundColor(displayColor),
        color: displayColor,
        textAlign: centered ? 'center' : undefined,
        justifyContent: centered ? 'center' : undefined,
        width: centered ? '100%' : undefined
      }}
    >
      {showIcon && displayIcon && (
        <span className="info-icon-wrapper">
          {displayIcon === 'loading-spinner' ? (
            <LOADING_ICON 
              size={LOADING_ICON_SIZE} 
              className={`info-icon ${type === 'loading' ? 'spinning' : ''}`} 
            />
          ) : (
            <IconRenderer 
              icon={displayIcon as any} 
              alt="" 
              className={`info-icon ${type === 'loading' ? 'spinning' : ''}`} 
              size={16}
            />
          )}
        </span>
      )}
      <span className="info-message">
        {showTitle && displayTitle && (
          <span className="info-title">{displayTitle}: </span>
        )}
        {message}
      </span>
    </div>
  );
};

export default InfoDisplay;
