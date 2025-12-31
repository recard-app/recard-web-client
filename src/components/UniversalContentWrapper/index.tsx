import React from 'react';
import './UniversalContentWrapper.scss';

interface UniversalContentWrapperProps {
  children: React.ReactNode;
  isSidePanelOpen: boolean;
  className?: string;
  fullHeight?: boolean; // For pages that should take full viewport height (like prompt window)
  disableSidebarMargin?: boolean; // For pages that don't use the sidebar (e.g., auth pages)
  whiteBackground?: boolean; // For pages that need a white background instead of default gray
}

const UniversalContentWrapper: React.FC<UniversalContentWrapperProps> = ({
  children,
  isSidePanelOpen,
  className = '',
  fullHeight = false,
  disableSidebarMargin = false,
  whiteBackground = false
}) => {
  return (
    <div
      className={`universal-content-wrapper ${isSidePanelOpen ? 'side-panel-open' : 'side-panel-closed'} ${fullHeight ? 'full-height' : ''} ${disableSidebarMargin ? 'no-sidebar-margin' : ''} ${whiteBackground ? 'white-background' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default UniversalContentWrapper; 