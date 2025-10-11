import React from 'react';
import { Link } from 'react-router-dom';
import { TEMP_ICON, SHOW_HEADER_ICONS, SIDEBAR_TOGGLE_ICON_COLOR } from '../../types';
import { IconRenderer, Icon } from '@/icons';
import './PageHeader.scss';

interface PageHeaderProps {
  title: string;
  icon?: string | React.ComponentType<any> | ((...args: any[]) => React.ReactElement);
  subtitle?: string;
  actions?: React.ReactNode;
  withActions?: boolean;
  onHelpClick?: () => void;
  showHelpButton?: boolean;
  titleLink?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  icon = TEMP_ICON,
  subtitle,
  actions,
  withActions = false,
  onHelpClick,
  showHelpButton = false,
  titleLink
}) => {
  const headerClasses = `page-header ${withActions || showHelpButton ? 'page-header-with-actions' : ''}`;

  const titleContent = (
    <>
      {SHOW_HEADER_ICONS && (
        <IconRenderer
          icon={icon}
          alt=""
          className="header-icon"
          size={20}
        />
      )}
      {title}
    </>
  );

  return (
    <div className={headerClasses}>
      <div className="header-title-section">
        <h1>
          {titleLink ? (
            <Link to={titleLink}>
              {titleContent}
            </Link>
          ) : (
            titleContent
          )}
        </h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {(actions || showHelpButton) && (
        <div className="header-actions">
          {actions}
          {showHelpButton && onHelpClick && (
            <button 
              className="help-icon-button icon-gray-hover"
              onClick={onHelpClick}
              aria-label="Open help"
              title="Help"
            >
              <Icon name="help" variant="outline" color={SIDEBAR_TOGGLE_ICON_COLOR} size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
