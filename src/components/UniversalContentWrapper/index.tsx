import React from 'react';
import './UniversalContentWrapper.scss';

interface UniversalContentWrapperProps {
  children: React.ReactNode;
  isSidePanelOpen: boolean;
  className?: string;
  fullHeight?: boolean; // For pages that should take full viewport height (like prompt window)
}

const UniversalContentWrapper: React.FC<UniversalContentWrapperProps> = ({ 
  children, 
  isSidePanelOpen, 
  className = '',
  fullHeight = false
}) => {
  return (
    <div 
      className={`universal-content-wrapper ${isSidePanelOpen ? 'side-panel-open' : 'side-panel-closed'} ${fullHeight ? 'full-height' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default UniversalContentWrapper; 