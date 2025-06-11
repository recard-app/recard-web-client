import React from 'react';
import './PageFooter.scss';

interface PageFooterProps {
  content?: React.ReactNode;
  actions?: React.ReactNode;
  withActions?: boolean;
  className?: string;
}

const PageFooter: React.FC<PageFooterProps> = ({
  content,
  actions,
  withActions = false,
  className = ''
}) => {
  const footerClasses = `page-footer ${withActions || actions ? 'page-footer-with-actions' : ''} ${className}`.trim();

  return (
    <div className={footerClasses}>
      {content && (
        <div className="footer-content-section">
          {content}
        </div>
      )}
      {(actions || withActions) && (
        <div className="footer-actions">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageFooter;
