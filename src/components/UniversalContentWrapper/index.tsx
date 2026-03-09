import React, { useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeColors } from '../../styling/themes';
import './UniversalContentWrapper.scss';

type BackgroundVariant = 'bg-white' | 'bg-lightest';

const VARIANT_COLOR_KEY: Record<BackgroundVariant, keyof ThemeColors> = {
  'bg-white': 'neutralWhite',
  'bg-lightest': 'neutralLightestGray',
};

interface UniversalContentWrapperProps {
  children: React.ReactNode;
  isSidePanelOpen: boolean;
  className?: string;
  fullHeight?: boolean; // For pages that should take full viewport height (like prompt window)
  disableSidebarMargin?: boolean; // For pages that don't use the sidebar (e.g., auth pages)
  backgroundVariant?: BackgroundVariant; // Per-page background color; also sets iOS Safari theme-color
}

const UniversalContentWrapper: React.FC<UniversalContentWrapperProps> = ({
  children,
  isSidePanelOpen,
  className = '',
  fullHeight = false,
  disableSidebarMargin = false,
  backgroundVariant
}) => {
  const { colors } = useTheme();

  // Sync iOS Safari / Android Chrome theme-color meta tag with the page background
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!meta) return;

    const color = backgroundVariant
      ? colors[VARIANT_COLOR_KEY[backgroundVariant]]
      : colors.neutralWhite;

    meta.setAttribute('content', color);

    return () => {
      meta.setAttribute('content', colors.neutralWhite);
    };
  }, [backgroundVariant, colors]);

  return (
    <div
      className={`universal-content-wrapper ${isSidePanelOpen ? 'side-panel-open' : 'side-panel-closed'} ${fullHeight ? 'full-height' : ''} ${disableSidebarMargin ? 'no-sidebar-margin' : ''} ${backgroundVariant ?? ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default UniversalContentWrapper; 