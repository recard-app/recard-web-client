import React from 'react';
import { TEMP_ICON, SHOW_HEADER_ICONS } from '../../types';
import './PageHeader.scss';

interface PageHeaderProps {
  title: string;
  icon?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  withActions?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  icon = TEMP_ICON,
  subtitle,
  actions,
  withActions = false
}) => {
  const headerClasses = `page-header ${withActions ? 'page-header-with-actions' : ''}`;

  return (
    <div className={headerClasses}>
      <h1>
        {SHOW_HEADER_ICONS && (
          <img src={icon} alt="" className="header-icon" />
        )}
        {title}
      </h1>
      {subtitle && <p>{subtitle}</p>}
      {actions && (
        <div className="header-actions">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
