import React from 'react';
import './InfoDisplay.scss';
import { INFO_COLORS, INFO_BG_COLORS, INFO_BORDER_COLORS, INFO_ICONS, INFO_TITLES, LOADING_ICON, LOADING_ICON_SIZE } from '../../types/Constants';
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
  hideOverflow?: boolean;
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
  centered = false,
  hideOverflow = false
}) => {
  // Default values based on type
  const getDefaultValues = () => {
    const key = (type === 'info' || !type) ? 'INFO'
      : type === 'default' ? 'DEFAULT'
      : type.toUpperCase() as keyof typeof INFO_COLORS;
    return {
      defaultTitle: INFO_TITLES[key],
      defaultColor: INFO_COLORS[key],
      defaultBg: INFO_BG_COLORS[key],
      defaultBorder: INFO_BORDER_COLORS[key],
      defaultIcon: INFO_ICONS[key]
    };
  };

  const { defaultTitle, defaultColor, defaultBg, defaultBorder, defaultIcon } = getDefaultValues();

  // Use provided values or fall back to defaults
  const displayTitle = title || defaultTitle;
  const displayColor = color || defaultColor;
  const displayIcon = icon || defaultIcon;

  const backgroundColor = transparent ? 'transparent' : (color ? `color-mix(in srgb, ${color} 10%, transparent)` : defaultBg);
  const borderColor = transparent ? 'transparent' : (color ? 'transparent' : defaultBorder);

  return (
    <div
      className={`info-component ${centered ? 'centered' : ''} ${hideOverflow ? 'hide-overflow' : ''}`}
      style={{
        backgroundColor,
        color: displayColor,
        border: borderColor !== 'transparent' ? `1px solid ${borderColor}` : undefined,
        // Keep text left-aligned when not centered; let CSS control centered variant
        textAlign: centered ? undefined : 'left',
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
