import React, { useState } from 'react';
import { Icon } from '../../icons';
import { ICON_GRAY, ICON_RED } from '../../types';
import './SettingsCard.scss';

interface SettingsCardProps {
  title: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  variant?: 'default' | 'danger';
  children: React.ReactNode;
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  collapsible = false,
  defaultCollapsed = false,
  variant = 'default',
  children
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const handleToggle = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className={`settings-card settings-card--${variant}`}>
      <div
        className={`settings-card__header ${collapsible ? 'settings-card__header--clickable' : ''}`}
        onClick={handleToggle}
        role={collapsible ? 'button' : undefined}
        tabIndex={collapsible ? 0 : undefined}
        onKeyDown={collapsible ? (e) => e.key === 'Enter' && handleToggle() : undefined}
        aria-expanded={collapsible ? !isCollapsed : undefined}
      >
        <h3 className="settings-card__title">{title}</h3>
        {collapsible && (
          <Icon
            name="chevron-down"
            variant="mini"
            size={16}
            color={variant === 'danger' ? ICON_RED : ICON_GRAY}
            className={`settings-card__chevron ${isCollapsed ? '' : 'settings-card__chevron--expanded'}`}
          />
        )}
      </div>
      <div
        className={`settings-card__content ${isCollapsed ? 'settings-card__content--collapsed' : ''}`}
        aria-hidden={isCollapsed}
      >
        <div className="settings-card__content-inner">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SettingsCard;
