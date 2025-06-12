import React from 'react';
import { TEMP_ICON, SHOW_HEADER_ICONS } from '../../types';
import { IconRenderer } from '../../icons';
import './PageHeader.scss';

interface PageHeaderProps {
  title: string;
  icon?: string | React.ComponentType<any> | ((...args: any[]) => React.ReactElement);
  subtitle?: string;
  actions?: React.ReactNode;
  withActions?: boolean;
  onHelpClick?: () => void;
  showHelpButton?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  icon = TEMP_ICON,
  subtitle,
  actions,
  withActions = false,
  onHelpClick,
  showHelpButton = false
}) => {
  const headerClasses = `page-header ${withActions || showHelpButton ? 'page-header-with-actions' : ''}`;

  return (
    <div className={headerClasses}>
      <div className="header-title-section">
        <h1>
          {SHOW_HEADER_ICONS && (
            <IconRenderer 
              icon={icon}
              alt=""
              className="header-icon"
              size={20}
            />
          )}
          {title}
        </h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {(actions || showHelpButton) && (
        <div className="header-actions">
          {actions}
          {showHelpButton && onHelpClick && (
            <button 
              className="help-icon-button"
              onClick={onHelpClick}
              aria-label="Open help"
              title="Help"
            >
              <img src={TEMP_ICON} alt="?" className="help-icon" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
