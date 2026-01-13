import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './DesignSystem.scss';

// Import sections
import DesignTokens from './sections/DesignTokens';
import ButtonSection from './sections/ButtonSection';
import InfoDisplaySection from './sections/InfoDisplaySection';
import FormElements from './sections/FormElements';
import ToggleBarSection from './sections/ToggleBarSection';
import DialogSection from './sections/DialogSection';
import CompositeComponents from './sections/CompositeComponents';
import ChatComponentsSection from './sections/ChatComponentsSection';

// Import UI components for viewport toggle
import { ToggleBar, ToggleBarButton } from '@/components/ui/toggle-bar/toggle-bar';

type ViewportMode = 'desktop' | 'mobile';

const DesignSystem: React.FC = () => {
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');

  const sections = [
    { id: 'tokens', label: 'Design Tokens' },
    { id: 'buttons', label: 'Buttons' },
    { id: 'info-display', label: 'InfoDisplay' },
    { id: 'form-elements', label: 'Form Elements' },
    { id: 'toggle-bar', label: 'Toggle Bar' },
    { id: 'dialogs', label: 'Dialogs & Drawers' },
    { id: 'composites', label: 'Composite Components' },
    { id: 'chat-components', label: 'Chat Components' },
  ];

  return (
    <div className="design-system-page">
      <header className="ds-header">
        <h1>Design System</h1>
        <div className="ds-header-actions">
          <div className="ds-viewport-toggle">
          <span className="ds-toggle-label">Viewport:</span>
          <ToggleBar>
            <ToggleBarButton
              pressed={viewportMode === 'desktop'}
              onPressedChange={() => setViewportMode('desktop')}
              size="small"
            >
              Desktop
            </ToggleBarButton>
            <ToggleBarButton
              pressed={viewportMode === 'mobile'}
              onPressedChange={() => setViewportMode('mobile')}
              size="small"
            >
              Mobile
            </ToggleBarButton>
          </ToggleBar>
          </div>
        <Link to="/design/components" className="ds-header-link">
            Full Components
          </Link>
        </div>
      </header>

      <nav className="ds-nav">
        {sections.map((section) => (
          <a key={section.id} href={`#${section.id}`}>
            {section.label}
          </a>
        ))}
      </nav>

      <div className={`ds-preview-container ${viewportMode}`}>
        <section id="tokens" className="ds-section">
          <DesignTokens />
        </section>

        <section id="buttons" className="ds-section">
          <ButtonSection />
        </section>

        <section id="info-display" className="ds-section">
          <InfoDisplaySection />
        </section>

        <section id="form-elements" className="ds-section">
          <FormElements />
        </section>

        <section id="toggle-bar" className="ds-section">
          <ToggleBarSection />
        </section>

        <section id="dialogs" className="ds-section">
          <DialogSection />
        </section>

        <section id="composites" className="ds-section">
          <CompositeComponents />
        </section>

        <section id="chat-components" className="ds-section">
          <ChatComponentsSection />
        </section>
      </div>
    </div>
  );
};

export default DesignSystem;

