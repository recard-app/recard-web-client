import React from 'react';
import Icon from '@/icons';

interface SectionHeaderProps {
  title: string;
  rightText?: string;
  rightTextColor?: string;
  icon?: string;
  iconColor?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, rightText, rightTextColor, icon, iconColor }) => (
  <div className="report-section-header">
    {icon && (
      <span className="report-section-header__icon" style={iconColor ? { color: iconColor } : undefined}>
        <Icon name={icon} variant="micro" size={14} />
      </span>
    )}
    <span className="report-section-header__title">{title}</span>
    {rightText && (
      <span
        className="report-section-header__right"
        style={rightTextColor ? { color: rightTextColor } : undefined}
      >
        {rightText}
      </span>
    )}
  </div>
);

export default SectionHeader;
