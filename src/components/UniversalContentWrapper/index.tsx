import React from 'react';
import './UniversalContentWrapper.scss';

type BackgroundVariant = 'bg-white' | 'bg-lightest';

interface UniversalContentWrapperProps {
  children: React.ReactNode;
  isSidePanelOpen: boolean;
  className?: string;
  fullHeight?: boolean; // For pages that should take full viewport height (like prompt window)
  disableSidebarMargin?: boolean; // For pages that don't use the sidebar (e.g., auth pages)
  backgroundVariant?: BackgroundVariant; // Per-page background color
}

const UniversalContentWrapper: React.FC<UniversalContentWrapperProps> = ({
  children,
  isSidePanelOpen,
  className = '',
  fullHeight = false,
  disableSidebarMargin = false,
  backgroundVariant
}) => {
  return (
    <div
      className={`universal-content-wrapper ${isSidePanelOpen ? 'side-panel-open' : 'side-panel-closed'} ${fullHeight ? 'full-height' : ''} ${disableSidebarMargin ? 'no-sidebar-margin' : ''} ${backgroundVariant ?? ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default UniversalContentWrapper; 