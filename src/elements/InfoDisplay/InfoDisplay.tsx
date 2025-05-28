import React from 'react';
import './InfoDisplay.scss';
import { INFO_COLORS, INFO_ICONS, INFO_TITLES } from '../../types/Constants';

interface InfoDisplayProps {
  type?: 'error' | 'info' | 'warning' | 'success';
  icon?: string;
  title?: string;
  message: string;
  color?: string;
}

export const InfoDisplay: React.FC<InfoDisplayProps> = ({
  type,
  icon,
  title,
  message,
  color
}) => {
  // Default values based on type
  const getDefaultValues = () => {
    switch (type) {
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
      className="info-component"
      style={{ 
        backgroundColor: getBackgroundColor(displayColor),
        color: displayColor 
      }}
    >
      {displayIcon && (
        <img src={displayIcon} alt="" className="info-icon" />
      )}
      <span className="info-message">
        {displayTitle && (
          <span className="info-title">{displayTitle}: </span>
        )}
        {message}
      </span>
    </div>
  );
};

export default InfoDisplay;
