import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '../../../icons';
import { ICON_GRAY, MOBILE_BREAKPOINT } from '../../../types';

interface HelpNavSectionProps {
  title: string;
  defaultExpanded?: boolean;
  /** When true, auto-expands the section (e.g. current page is in this section). */
  containsActivePage?: boolean;
  /** Current pathname -- used on mobile to reset sections on navigation. */
  pathname?: string;
  children: React.ReactNode;
}

const HelpNavSection: React.FC<HelpNavSectionProps> = ({
  title,
  defaultExpanded = false,
  containsActivePage = false,
  pathname,
  children
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || containsActivePage);

  const isMobile = useCallback(
    () => window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches,
    []
  );

  // Mobile: reset all sections on every navigation -- only active section stays open
  // Desktop: only auto-expand the active section, leave manual toggles alone
  useEffect(() => {
    if (isMobile()) {
      setIsExpanded(containsActivePage);
    } else if (containsActivePage) {
      setIsExpanded(true);
    }
  }, [containsActivePage, pathname, isMobile]);

  return (
    <div className="help-nav-section">
      <button
        type="button"
        className="help-nav-section__header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className="help-nav-section__title">{title}</span>
        <Icon
          name="chevron-down"
          variant="mini"
          size={14}
          color={ICON_GRAY}
          className={`help-nav-section__chevron ${isExpanded ? 'help-nav-section__chevron--expanded' : ''}`}
        />
      </button>
      <div
        className={`help-nav-section__content ${isExpanded ? '' : 'help-nav-section__content--collapsed'}`}
        aria-hidden={!isExpanded}
      >
        <div className="help-nav-section__content-inner">
          <div className="help-nav-section__content-padding">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpNavSection;
