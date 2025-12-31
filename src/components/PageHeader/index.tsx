import React from 'react';
import { Link } from 'react-router-dom';
import { TEMP_ICON, SHOW_HEADER_ICONS } from '../../types';
import { IconRenderer } from '@/icons';
import './PageHeader.scss';

interface PageHeaderProps {
  title: string;
  icon?: string | React.ComponentType<any> | ((...args: any[]) => React.ReactElement);
  subtitle?: string;
  actions?: React.ReactNode;
  withActions?: boolean;
  titleLink?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  icon = TEMP_ICON,
  subtitle,
  actions,
  withActions = false,
  titleLink
}) => {
  const headerClasses = `page-header ${withActions ? 'page-header-with-actions' : ''}`;

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
      {actions && (
        <div className="header-actions">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
