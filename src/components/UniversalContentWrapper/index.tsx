import React from 'react';
import './UniversalContentWrapper.scss';

type BackgroundVariant = 'bg-white' | 'bg-lightest';

interface UniversalContentWrapperProps {
  children: React.ReactNode;
  isSidePanelOpen: boolean;
  className?: string;
  fullHeight?: boolean; // For pages that should take full viewport height (like prompt window)
  edgeToEdge?: boolean; // For list pages where items should span full container width
  disableSidebarMargin?: boolean; // For pages that don't use the sidebar (e.g., auth pages)
  backgroundVariant?: BackgroundVariant; // Per-page background color
}

const UniversalContentWrapper: React.FC<UniversalContentWrapperProps> = ({
  children,
  isSidePanelOpen,
  className = '',
  fullHeight = false,
  edgeToEdge = false,
  disableSidebarMargin = false,
  backgroundVariant
}) => {
  return (
    <div
      className={`universal-content-wrapper ${isSidePanelOpen ? 'side-panel-open' : 'side-panel-closed'} ${fullHeight ? 'full-height' : ''} ${edgeToEdge ? 'edge-to-edge' : ''} ${disableSidebarMargin ? 'no-sidebar-margin' : ''} ${backgroundVariant ?? ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default UniversalContentWrapper; 