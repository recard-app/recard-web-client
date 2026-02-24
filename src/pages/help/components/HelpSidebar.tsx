import React from 'react';
import HelpNavSection from './HelpNavSection';
import HelpNavItem from './HelpNavItem';
import { DAILY_ZEN_FEATURE_NAME } from '../../../types';

interface HelpSidebarProps {
  onNavClick?: () => void;
}

const HelpSidebar: React.FC<HelpSidebarProps> = ({ onNavClick }) => {
  return (
    <nav className="help-sidebar" aria-label="Help navigation">
      <HelpNavItem label="Getting Started" to="/help" onClick={onNavClick} />

      <HelpNavSection title="Ask the AI" defaultExpanded={true}>
        <HelpNavItem label="Overview" to="/help/ask-ai" indent onClick={onNavClick} />
        <HelpNavItem label="Example Prompts" to="/help/ask-ai/prompts" indent onClick={onNavClick} />
        <HelpNavItem label="Tips for Better Answers" to="/help/ask-ai/tips" indent onClick={onNavClick} />
        <HelpNavItem label="Chat History" to="/help/chat-history" indent onClick={onNavClick} />
        <HelpNavItem label={DAILY_ZEN_FEATURE_NAME} to="/help/daily-digest" indent onClick={onNavClick} />
      </HelpNavSection>

      <HelpNavSection title="Your Cards" defaultExpanded={true}>
        <HelpNavItem label="Adding Cards" to="/help/cards" indent onClick={onNavClick} />
        <HelpNavItem label="Card Settings" to="/help/cards/settings" indent onClick={onNavClick} />
        <HelpNavItem label="Card Details" to="/help/cards/details" indent onClick={onNavClick} />
      </HelpNavSection>

      <HelpNavSection title="Credit Tracking" defaultExpanded={true}>
        <HelpNavItem label="Understanding Credits" to="/help/credits" indent onClick={onNavClick} />
        <HelpNavItem label="Credits Dashboard" to="/help/credits/dashboard" indent onClick={onNavClick} />
        <HelpNavItem label="Updating Credits" to="/help/credits/updating" indent onClick={onNavClick} />
        <HelpNavItem label="Credit History" to="/help/credits/history" indent onClick={onNavClick} />
      </HelpNavSection>

      <HelpNavSection title="Account & Settings" defaultExpanded={true}>
        <HelpNavItem label="Account Settings" to="/help/account" indent onClick={onNavClick} />
        <HelpNavItem label="Preferences" to="/help/preferences" indent onClick={onNavClick} />
      </HelpNavSection>

      <HelpNavSection title="Quick Reference" defaultExpanded={true}>
        <HelpNavItem label="Status Colors" to="/help/reference/colors" indent onClick={onNavClick} />
        <HelpNavItem label="Earning Frequencies" to="/help/reference/frequencies" indent onClick={onNavClick} />
        <HelpNavItem label="Glossary" to="/help/glossary" indent onClick={onNavClick} />
      </HelpNavSection>

      <HelpNavItem label="FAQ" to="/help/faq" onClick={onNavClick} />
      <HelpNavItem label="Troubleshooting" to="/help/troubleshooting" onClick={onNavClick} />
    </nav>
  );
};

export default HelpSidebar;
