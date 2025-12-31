import React, { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { PAGE_NAMES, PAGE_ICONS } from '../../types';
import PageHeader from '../../components/PageHeader';
import ContentContainer from '../../components/ContentContainer';
import { HelpSidebar } from './components';
import { Icon } from '../../icons';
import { ICON_GRAY } from '../../types';
import { useFullHeight } from '../../hooks/useFullHeight';
import './Help.scss';

const Help: React.FC = () => {
  useFullHeight(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Close mobile sidebar when a nav item is clicked
  const handleNavClick = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  return (
    <div className="full-page-layout">
      <PageHeader title={PAGE_NAMES.HELP_CENTER} icon={PAGE_ICONS.HELP_CENTER.MINI} />
      <div className="full-page-content">
        <ContentContainer size="lg">
          <div className="help-layout">
            {/* Mobile toggle button */}
            <button
              type="button"
              className="help-layout__mobile-toggle"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              aria-expanded={isMobileSidebarOpen}
              aria-label="Toggle help navigation"
            >
              <Icon
                name="bars-3"
                variant="mini"
                size={20}
                color={ICON_GRAY}
              />
              <span>Help Center Navigation</span>
              <Icon
                name="chevron-down"
                variant="mini"
                size={16}
                color={ICON_GRAY}
                className={`help-layout__mobile-toggle-chevron ${isMobileSidebarOpen ? 'help-layout__mobile-toggle-chevron--expanded' : ''}`}
              />
            </button>

            {/* Sidebar */}
            <div className={`help-layout__sidebar ${isMobileSidebarOpen ? 'help-layout__sidebar--open' : ''}`}>
              <HelpSidebar onNavClick={handleNavClick} />
            </div>

            {/* Content area */}
            <div className="help-layout__content">
              <Outlet />
            </div>
          </div>
        </ContentContainer>
      </div>
    </div>
  );
};

export default Help;
