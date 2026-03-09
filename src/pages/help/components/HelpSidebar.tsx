import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HelpNavSection from './HelpNavSection';
import HelpNavItem from './HelpNavItem';
import { HelpService } from '../../../services/helpService';
import type { HelpTocCategory } from '../../../types';

/** Categories rendered as top-level nav items (no section wrapper). */
const TOP_LEVEL_CATEGORIES = new Set(['getting-started', 'faq', 'troubleshooting']);

/**
 * Map article IDs to URL paths for sidebar links.
 * Most IDs map to /help/{id}. Special cases preserve existing nested URLs
 * so bookmarks continue to work and the URL structure stays readable.
 */
const ID_TO_PATH_OVERRIDES: Record<string, string> = {
  'account-settings': '/help/account',
  'reference-colors': '/help/reference/colors',
  'reference-frequencies': '/help/reference/frequencies',
  'ask-ai-prompts': '/help/ask-ai/prompts',
  'ask-ai-tips': '/help/ask-ai/tips',
  'cards-settings': '/help/cards/settings',
  'cards-details': '/help/cards/details',
  'credits-dashboard': '/help/credits/dashboard',
  'credits-updating': '/help/credits/updating',
  'credits-history': '/help/credits/history',
};

function articleIdToPath(id: string): string {
  return ID_TO_PATH_OVERRIDES[id] || `/help/${id}`;
}

interface HelpSidebarProps {
  onNavClick?: () => void;
}

const HelpSidebar: React.FC<HelpSidebarProps> = ({ onNavClick }) => {
  const [categories, setCategories] = useState<HelpTocCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    HelpService.fetchTableOfContents()
      .then(setCategories)
      .catch(() => { /* TOC load failure -- sidebar stays empty */ })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <nav className="help-sidebar" aria-label="Help navigation">
        <div className="help-sidebar__loading">Loading...</div>
      </nav>
    );
  }

  // Separate top-level items from section-grouped items
  const topLevel: HelpTocCategory[] = [];
  const sections: HelpTocCategory[] = [];

  for (const cat of categories) {
    if (TOP_LEVEL_CATEGORIES.has(cat.category)) {
      topLevel.push(cat);
    } else {
      sections.push(cat);
    }
  }

  // Find Getting Started category (renders first, links to /help)
  const gettingStarted = topLevel.find(c => c.category === 'getting-started');
  // FAQ and Troubleshooting render after sections
  const faq = topLevel.find(c => c.category === 'faq');
  const troubleshooting = topLevel.find(c => c.category === 'troubleshooting');

  return (
    <nav className="help-sidebar" aria-label="Help navigation">
      {/* Getting Started -- top-level, links to /help index */}
      {gettingStarted && (
        <HelpNavItem
          label={gettingStarted.articles[0]?.title || gettingStarted.label}
          to="/help"
          onClick={onNavClick}
        />
      )}

      {/* Category sections */}
      {sections.map((section) => {
        const sectionHasActivePage = section.articles.some(
          (article) => location.pathname === articleIdToPath(article.id)
        );
        return (
          <HelpNavSection
            key={section.category}
            title={section.label}
            containsActivePage={sectionHasActivePage}
            pathname={location.pathname}
          >
            {section.articles.map((article) => (
              <HelpNavItem
                key={article.id}
                label={article.title}
                to={articleIdToPath(article.id)}
                indent
                onClick={onNavClick}
              />
            ))}
          </HelpNavSection>
        );
      })}

      {/* FAQ -- top-level */}
      {faq && faq.articles[0] && (
        <HelpNavItem
          label={faq.label}
          to={articleIdToPath(faq.articles[0].id)}
          onClick={onNavClick}
        />
      )}

      {/* Troubleshooting -- top-level */}
      {troubleshooting && troubleshooting.articles[0] && (
        <HelpNavItem
          label={troubleshooting.label}
          to={articleIdToPath(troubleshooting.articles[0].id)}
          onClick={onNavClick}
        />
      )}
    </nav>
  );
};

export default HelpSidebar;
