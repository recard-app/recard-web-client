import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/icons';
import { ICON_GRAY } from '@/types';
import { COLORS } from '@/types/Colors';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';

// Design system styles
import '../DesignSystem.scss';
import './ButtonsShowcase.scss';

// Component SCSS imports -- editing any of these will reflect here via HMR
import '../../authentication/Auth.scss';
import '../../../components/CreditCardDetailView/CreditCardDetailView.scss';
import '../../../components/AppSidebar/AppSidebar.scss';
import '../../../components/MobileHeader/MobileHeader.scss';
import '../../../components/HistoryPanel/HistoryEntry/HistoryEntry.scss';
import '../../../components/HistoryPanel/HistoryPanel.scss';
import '../../../components/CreditsDisplay/CreditList/CreditEntry/CreditEntry.scss';
import '../../../components/CreditsDisplay/CreditList/CreditEntry/CreditEntryDetails/CreditEntryDetails.scss';
import '../../../components/CreditCardManager/CreditCardManager.scss';
import '../../../components/ui/select-card/SelectCard.scss';
import '../../../elements/TabBar/TabBar.scss';
import '../../../components/PromptWindow/PromptWindow.scss';
import '../../../components/PromptWindow/DailyDigest/DailyDigest.scss';
import '../../../elements/DatePicker/DatePicker.scss';
import '../../../components/ui/dialog/dialog.scss';
import '../../help/Help.scss';

interface Usage {
  component: string;
  page: string;
}

const BUTTON_USAGE: Record<string, Usage[]> = {
  'submit-button': [
    { component: 'pages/authentication/SignIn.tsx', page: 'Sign In' },
    { component: 'pages/authentication/SignUp.tsx', page: 'Sign Up' },
    { component: 'pages/authentication/ForgotPassword.tsx', page: 'Forgot Password' },
    { component: 'pages/authentication/AuthAction.tsx', page: 'Auth Action' },
  ],
  'social-button': [
    { component: 'pages/authentication/SignIn.tsx', page: 'Sign In' },
    { component: 'pages/authentication/SignUp.tsx', page: 'Sign Up' },
  ],
  'preferred-button': [
    { component: 'components/CreditCardDetailView/index.tsx', page: 'Card detail view (dialog/drawer)' },
  ],
  'freeze-button': [
    { component: 'components/CreditCardDetailView/index.tsx', page: 'Card detail view (dialog/drawer)' },
  ],
  'tab-button': [
    { component: 'components/CreditCardDetailView/index.tsx', page: 'Card detail view (dialog/drawer)' },
  ],
  'edit-date-inline-button': [
    { component: 'components/CreditCardDetailView/index.tsx', page: 'Card detail view (dialog/drawer)' },
  ],
  'remove-card-button': [
    { component: 'components/CreditCardDetailView/index.tsx', page: 'Card detail view (dialog/drawer)' },
  ],
  'toggle-button': [
    { component: 'components/AppSidebar/index.tsx', page: 'All authenticated pages (sidebar)' },
  ],
  'mini-nav-icon': [
    { component: 'components/AppSidebar/index.tsx', page: 'All authenticated pages (sidebar collapsed)' },
  ],
  'new-chat-button': [
    { component: 'components/AppSidebar/index.tsx', page: 'All authenticated pages (sidebar)' },
  ],
  'profile-trigger-button': [
    { component: 'components/AppSidebar/index.tsx', page: 'All authenticated pages (sidebar)' },
    { component: 'components/MobileHeader/index.tsx', page: 'All authenticated pages (mobile header)' },
  ],
  'mini-profile-trigger': [
    { component: 'components/AppSidebar/index.tsx', page: 'All authenticated pages (sidebar collapsed)' },
  ],
  'mobile-header__menu-button': [
    { component: 'components/MobileHeader/index.tsx', page: 'All pages (mobile)' },
  ],
  'mobile-header__new-chat-button': [
    { component: 'components/MobileHeader/index.tsx', page: 'Home page (mobile)' },
  ],
  'mobile-drawer-close': [
    { component: 'components/MobileHeader/index.tsx', page: 'Mobile drawer' },
  ],
  'action-icon-button': [
    { component: 'components/HistoryPanel/HistoryEntry/index.tsx', page: 'History panel (sidebar + /history)' },
  ],
  'rename-buttons-history': [
    { component: 'components/HistoryPanel/HistoryEntry/index.tsx', page: 'History panel rename save/cancel' },
  ],
  'pagination': [
    { component: 'components/HistoryPanel/FullHistoryPanel.tsx', page: '/history page' },
  ],
  'credit-usage-button': [
    { component: 'components/CreditsDisplay/CreditList/CreditEntry/index.tsx', page: 'My Credits page' },
  ],
  'credit-modal-controls': [
    { component: 'components/CreditsDisplay/CreditList/CreditEntry/CreditEntryDetails/index.tsx', page: 'Credit edit modal/drawer' },
  ],
  'alert-dialog-card-manager': [
    { component: 'components/CreditCardManager/index.tsx', page: 'My Cards page (delete card AlertDialog)' },
  ],
  'select-card-button': [
    { component: 'components/ui/select-card/select-card.tsx', page: 'Chat prompt, credit entry' },
  ],
  'selected-card-button': [
    { component: 'components/ui/select-card/select-card.tsx', page: 'Chat prompt, credit entry' },
  ],
  'deselect-button': [
    { component: 'components/ui/select-card/select-card.tsx', page: 'Chat prompt, credit entry' },
  ],
  'tab-bar-button': [
    { component: 'elements/TabBar/TabBar.tsx', page: 'My Credits page, Preferences' },
  ],
  'inline-button': [
    { component: 'components/PromptWindow/index.tsx', page: 'Home page (chat input area)' },
  ],
  'daily-digest__regenerate-button': [
    { component: 'components/PromptWindow/DailyDigest/index.tsx', page: 'Home page (daily digest)' },
  ],
  'date-picker-clear': [
    { component: 'elements/DatePicker/DatePicker.tsx', page: 'Card detail view (open date)' },
  ],
  'date-picker-calendar-btn': [
    { component: 'elements/DatePicker/DatePicker.tsx', page: 'Card detail view (open date)' },
  ],
  'help-layout__mobile-toggle': [
    { component: 'pages/help/Help.tsx', page: 'Help Center (mobile)' },
  ],
  'help-nav-section__header': [
    { component: 'pages/help/components/HelpNavSection.tsx', page: 'Help Center sidebar' },
  ],
  'help-section__header': [
    { component: 'pages/help/components/HelpSection.tsx', page: 'Help Center content sections' },
  ],
  'dialog-footer-buttons': [
    { component: 'components/ui/dialog/dialog.tsx', page: 'All dialogs with footer actions' },
  ],
  'global-variants': [
    { component: 'globals.scss / mixins.scss', page: 'Used across the entire app via .button class' },
  ],
};

const UsageDetails: React.FC<{ usages: Usage[] }> = ({ usages }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bs-usage">
      <button
        type="button"
        className="bs-usage-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="bs-usage-toggle-text">
          Used in {usages.length} {usages.length === 1 ? 'place' : 'places'}
        </span>
        <Icon
          name="chevron-down"
          variant="micro"
          size={12}
          color={ICON_GRAY}
          className={`bs-usage-chevron ${isOpen ? 'bs-usage-chevron--expanded' : ''}`}
        />
      </button>
      <div
        className={`bs-usage-content ${isOpen ? '' : 'bs-usage-content--collapsed'}`}
        aria-hidden={!isOpen}
      >
        <div className="bs-usage-content-inner">
          <ul className="bs-usage-list">
            {usages.map((u, i) => (
              <li key={i} className="bs-usage-entry">
                <span className="bs-usage-component">{u.component}</span>
                <span className="bs-usage-page">{u.page}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const sections = [
  { id: 'global', label: 'Global System' },
  { id: 'auth', label: 'Auth' },
  { id: 'card-detail', label: 'Card Detail' },
  { id: 'sidebar', label: 'Sidebar' },
  { id: 'mobile-header', label: 'Mobile Header' },
  { id: 'history', label: 'History' },
  { id: 'history-pagination', label: 'History Pagination' },
  { id: 'credit-entry', label: 'Credit Entry' },
  { id: 'card-manager', label: 'Card Manager' },
  { id: 'select-card', label: 'Select Card' },
  { id: 'tab-bar', label: 'Tab Bar' },
  { id: 'utility', label: 'Utility' },
  { id: 'help', label: 'Help Page' },
  { id: 'dialog-footer', label: 'Dialog Footer' },
];

const ButtonsShowcase: React.FC = () => {
  return (
    <div className="buttons-showcase">
      {/* Header */}
      <header className="ds-header">
        <h1>All Buttons</h1>
        <div className="ds-header-actions">
          <Link to="/design" className="ds-header-link">
            Design System
          </Link>
        </div>
      </header>

      {/* Navigation */}
      <nav className="ds-nav">
        {sections.map((s) => (
          <a key={s.id} href={`#${s.id}`}>{s.label}</a>
        ))}
      </nav>

      {/* ================================================================ */}
      {/* SECTION 1: Global System */}
      {/* ================================================================ */}
      <section id="global" className="bs-section">
        <h2 className="bs-section-title">Global System</h2>
        <p className="bs-section-source">globals.scss / mixins.scss</p>
        <UsageDetails usages={BUTTON_USAGE['global-variants']} />

        {/* Variants */}
        <div className="ds-variant-group">
          <h3 className="ds-variant-label">Variants</h3>
          <div className="bs-grid">
            {[
              { name: 'Primary', cls: 'button' },
              { name: 'Secondary', cls: 'button secondary' },
              { name: 'Outline', cls: 'button outline' },
              { name: 'Ghost', cls: 'button ghost' },
              { name: 'Destructive', cls: 'button destructive' },
              { name: 'No Outline', cls: 'button no-outline' },
            ].map((b) => (
              <div key={b.cls} className="bs-item">
                <span className="bs-item-label">{b.name}</span>
                <span className="bs-item-class">{b.cls}</span>
                <button className={b.cls}>{b.name}</button>
              </div>
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div className="ds-variant-group">
          <h3 className="ds-variant-label">Sizes</h3>
          <div className="bs-grid">
            {[
              { name: 'Default', cls: 'button' },
              { name: 'Mini', cls: 'button mini' },
              { name: 'Small', cls: 'button small' },
              { name: 'Large', cls: 'button large' },
            ].map((b) => (
              <div key={b.cls} className="bs-item">
                <span className="bs-item-label">{b.name}</span>
                <button className={b.cls}>{b.name}</button>
              </div>
            ))}
          </div>
        </div>

        {/* Icons */}
        <div className="ds-variant-group">
          <h3 className="ds-variant-label">With Icons</h3>
          <div className="bs-grid">
            <div className="bs-item">
              <span className="bs-item-label">Icon only</span>
              <button className="button icon">
                <Icon name="plus-circle" variant="mini" size={16} />
              </button>
            </div>
            <div className="bs-item">
              <span className="bs-item-label">Icon + text</span>
              <button className="button icon with-text">
                <Icon name="plus-circle" variant="mini" size={16} />
                Add Item
              </button>
            </div>
            <div className="bs-item">
              <span className="bs-item-label">Ghost icon + text</span>
              <button className="button ghost icon with-text">
                <Icon name="preferences" variant="mini" size={16} />
                Settings
              </button>
            </div>
            <div className="bs-item">
              <span className="bs-item-label">Destructive icon</span>
              <button className="button destructive icon with-text">
                <Icon name="delete" variant="mini" size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Icon sizes */}
        <div className="ds-variant-group">
          <h3 className="ds-variant-label">Icon Button Sizes</h3>
          <div className="bs-grid">
            <div className="bs-item bs-item-compact">
              <span className="bs-item-label">Mini</span>
              <button className="button icon mini">
                <Icon name="plus-circle" variant="micro" size={12} />
              </button>
            </div>
            <div className="bs-item bs-item-compact">
              <span className="bs-item-label">Small</span>
              <button className="button icon small">
                <Icon name="plus-circle" variant="mini" size={16} />
              </button>
            </div>
            <div className="bs-item bs-item-compact">
              <span className="bs-item-label">Large</span>
              <button className="button icon large">
                <Icon name="plus-circle" variant="mini" size={20} />
              </button>
            </div>
            <div className="bs-item bs-item-compact">
              <span className="bs-item-label">Square</span>
              <button className="button icon small square">
                <Icon name="plus-circle" variant="mini" size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* States */}
        <div className="ds-variant-group">
          <h3 className="ds-variant-label">States</h3>
          <div className="bs-grid">
            <div className="bs-item">
              <span className="bs-item-label">Normal</span>
              <button className="button">Normal</button>
            </div>
            <div className="bs-item">
              <span className="bs-item-label">Disabled (attr)</span>
              <button className="button" disabled>Disabled</button>
            </div>
            <div className="bs-item">
              <span className="bs-item-label">Disabled (class)</span>
              <button className="button disabled">Disabled</button>
            </div>
            <div className="bs-item">
              <span className="bs-item-label">Loading</span>
              <button className="button loading">Loading...</button>
            </div>
          </div>
        </div>

        {/* Ghost Destructive */}
        <div className="ds-variant-group">
          <h3 className="ds-variant-label">Ghost Destructive</h3>
          <div className="bs-grid">
            <div className="bs-item">
              <span className="bs-item-label">Ghost + Destructive</span>
              <button className="button ghost destructive">Cancel</button>
            </div>
            <div className="bs-item bs-item-compact">
              <span className="bs-item-label">Ghost Destructive Icon</span>
              <button className="button ghost destructive icon">
                <Icon name="delete" variant="mini" size={16} />
              </button>
            </div>
            <div className="bs-item">
              <span className="bs-item-label">Ghost Destructive + Text</span>
              <button className="button ghost destructive icon with-text">
                <Icon name="delete" variant="mini" size={16} />
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* Size + Variant combos */}
        <div className="ds-variant-group">
          <h3 className="ds-variant-label">Size + Variant Combos</h3>
          <div className="bs-grid">
            <div className="bs-item">
              <span className="bs-item-label">Small + Outline</span>
              <button className="button small outline">Small Outline</button>
            </div>
            <div className="bs-item">
              <span className="bs-item-label">Mini + Secondary</span>
              <button className="button mini secondary">Mini Secondary</button>
            </div>
            <div className="bs-item">
              <span className="bs-item-label">Large + Destructive</span>
              <button className="button large destructive">Large Destructive</button>
            </div>
            <div className="bs-item">
              <span className="bs-item-label">Small + Ghost + Icon</span>
              <button className="button small ghost icon with-text">
                <Icon name="preferences" variant="mini" size={16} />
                Edit
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 2: Auth Buttons */}
      {/* ================================================================ */}
      <section id="auth" className="bs-section">
        <h2 className="bs-section-title">Auth Buttons</h2>
        <p className="bs-section-source">pages/authentication/Auth.scss</p>

        <div className="bs-grid">
          <div className="bs-item bs-item-wide">
            <span className="bs-item-label">.submit-button</span>
            <UsageDetails usages={BUTTON_USAGE['submit-button']} />
            <button className="submit-button" type="button">Sign In</button>
          </div>
          <div className="bs-item bs-item-wide">
            <span className="bs-item-label">.submit-button (disabled)</span>
            <button className="submit-button" type="button" disabled>Disabled</button>
          </div>
          <div className="bs-item bs-item-wide">
            <span className="bs-item-label">.submit-button (loading)</span>
            <button className="submit-button" type="button" disabled>
              <svg className="button-spinner" viewBox="0 0 24 24" width="18" height="18">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" />
              </svg>
            </button>
          </div>
          <div className="bs-item bs-item-wide">
            <span className="bs-item-label">.social-button</span>
            <UsageDetails usages={BUTTON_USAGE['social-button']} />
            <button className="social-button" type="button">
              <span className="google-icon">G</span>
              Continue with Google
            </button>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 3: Card Detail Buttons */}
      {/* ================================================================ */}
      <section id="card-detail" className="bs-section">
        <h2 className="bs-section-title">Card Detail Buttons</h2>
        <p className="bs-section-source">components/CreditCardDetailView/CreditCardDetailView.scss</p>

        {/* Action buttons need .card-details wrapper */}
        <div className="card-details">
          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Action Buttons</h3>
            <UsageDetails usages={BUTTON_USAGE['preferred-button']} />
            <div className="card-action-buttons" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className="preferred-button" type="button">
                <Icon name="star" variant="outline" size={16} className="preferred-icon" />
                Preferred
              </button>
              <button className="preferred-button is-preferred" type="button">
                <Icon name="star" variant="solid" size={16} className="preferred-icon" />
                Preferred
              </button>
              <button className="preferred-button is-loading" type="button" disabled>
                <svg className="loading-spinner" viewBox="0 0 24 24" width="16" height="16">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" />
                </svg>
              </button>
              <button className="freeze-button" type="button">
                <Icon name="snowflake" variant="solid" size={16} color={ICON_GRAY} className="freeze-icon" />
                Freeze
              </button>
              <button className="freeze-button is-frozen" type="button">
                <Icon name="snowflake" variant="solid" size={16} className="freeze-icon" />
                Frozen
              </button>
            </div>
          </div>

          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Tab Buttons</h3>
            <UsageDetails usages={BUTTON_USAGE['tab-button']} />
            <div className="component-tabs" style={{ display: 'flex', gap: '0' }}>
              <button className="tab-button active" type="button">
                <span className="tab-label">Multipliers</span>
                <span className="tab-count">5</span>
              </button>
              <button className="tab-button" type="button">
                <span className="tab-label">Credits</span>
                <span className="tab-count">3</span>
              </button>
              <button className="tab-button" type="button">
                <span className="tab-label">Perks</span>
                <span className="tab-count">8</span>
              </button>
            </div>
          </div>

          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Inline Edit</h3>
            <UsageDetails usages={BUTTON_USAGE['edit-date-inline-button']} />
            <div className="card-stats-bar">
              <button className="edit-date-inline-button" type="button">
                <Icon name="pencil" variant="mini" size={16} color={ICON_GRAY} />
              </button>
            </div>
          </div>

          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Remove Card</h3>
            <UsageDetails usages={BUTTON_USAGE['remove-card-button']} />
            <div className="bs-inline-row">
              <button className="button ghost destructive icon small square" type="button" aria-label="Remove Card">
                <Icon name="delete" variant="mini" size={20} className="delete-icon" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 4: Sidebar Buttons */}
      {/* ================================================================ */}
      <section id="sidebar" className="bs-section">
        <h2 className="bs-section-title">Sidebar Buttons</h2>
        <p className="bs-section-source">components/AppSidebar/AppSidebar.scss</p>

        <div className="app-sidebar" style={{ position: 'relative', width: '280px' }}>
          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Toggle Button</h3>
            <UsageDetails usages={BUTTON_USAGE['toggle-button']} />
            <div className="sidebar-top">
              <div className="sidebar-toggle">
                <div className="bs-inline-row">
                  <button className="button no-outline small icon-gray-hover" type="button" aria-label="Close sidebar">
                    <Icon name="sidebar" variant="close" color={ICON_GRAY} size={20} />
                  </button>
                  <button className="button no-outline small icon-gray-hover" type="button" aria-label="Open sidebar">
                    <Icon name="sidebar" variant="open" color={ICON_GRAY} size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Mini Nav Icons</h3>
            <UsageDetails usages={BUTTON_USAGE['mini-nav-icon']} />
            <div className="bs-bg-white">
              <div className="mini-nav-icons" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <button className="button no-outline new-chat-button" type="button">
                  <Icon name="plus-circle" variant="solid" color={COLORS.PRIMARY_COLOR} size={24} />
                </button>
                <button className="mini-nav-icon" type="button">
                  <Icon name="home" variant="outline" color={ICON_GRAY} size={20} />
                </button>
                <button className="mini-nav-icon active" type="button">
                  <Icon name="card" variant="solid" color={COLORS.PRIMARY_COLOR} size={20} />
                </button>
                <button className="mini-nav-icon" type="button">
                  <Icon name="conversation-bubbles" variant="outline" color={ICON_GRAY} size={20} />
                </button>
                <button className="mini-nav-icon" type="button">
                  <Icon name="banknotes" variant="outline" color={ICON_GRAY} size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="ds-variant-group">
            <h3 className="ds-variant-label">New Chat Button</h3>
            <UsageDetails usages={BUTTON_USAGE['new-chat-button']} />
            <div className="bs-inline-row">
              <button className="button no-outline new-chat-button" type="button">
                <Icon name="plus-circle" variant="solid" color={COLORS.PRIMARY_COLOR} size={24} />
              </button>
            </div>
          </div>

          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Profile Triggers</h3>
            <UsageDetails usages={BUTTON_USAGE['profile-trigger-button']} />
            <div className="sidebar-bottom">
              <div className="user-profile-section">
                <button className="profile-trigger-button" type="button">
                  <div className="profile-trigger">
                    <span className="profile-image" style={{ width: 40, height: 40, borderRadius: '50%', background: '#ccc', display: 'inline-block' }} />
                    <div className="profile-info">
                      <span className="profile-name">John Doe</span>
                      <span className="profile-plan">Free</span>
                    </div>
                    <Icon name="ellipsis-vertical" variant="mini" size={20} color={ICON_GRAY} className="profile-options-icon" />
                  </div>
                </button>
              </div>
            </div>
            <UsageDetails usages={BUTTON_USAGE['mini-profile-trigger']} />
            <div className="mini-nav-icons" style={{ marginTop: 8 }}>
              <button className="mini-nav-icon mini-profile-trigger" type="button">
                <span className="mini-profile-image" style={{ width: 40, height: 40, borderRadius: '50%', background: '#ccc', display: 'inline-block' }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 5: Mobile Header Buttons */}
      {/* ================================================================ */}
      <section id="mobile-header" className="bs-section">
        <h2 className="bs-section-title">Mobile Header Buttons</h2>
        <p className="bs-section-source">components/MobileHeader/MobileHeader.scss</p>

        <UsageDetails usages={BUTTON_USAGE['mobile-header__menu-button']} />
        <div className="mobile-header" style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '8px 16px', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div className="mobile-header__actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="button no-outline small icon-gray-hover-fill mobile-header__menu-button" type="button" aria-label="Open menu">
              <Icon name="bar-menu" variant="mini" size={22} color={ICON_GRAY} />
            </button>
            <button className="button ghost small icon with-text mobile-header__new-chat-button" type="button">
              <Icon name="chat-bubble" variant="micro" size={16} />
              New Chat
            </button>
          </div>
        </div>

        <div className="ds-variant-group" style={{ marginTop: 16 }}>
          <h3 className="ds-variant-label">Mobile Drawer Close</h3>
          <UsageDetails usages={BUTTON_USAGE['mobile-drawer-close']} />
          <div className="mobile-drawer" style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '8px' }}>
            <div className="mobile-drawer-header">
              <button className="mobile-drawer-close button no-outline small icon-gray-hover-fill" type="button" aria-label="Close menu">
                <Icon name="arrow-left" variant="mini" size={22} color={ICON_GRAY} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 6: History Buttons */}
      {/* ================================================================ */}
      <section id="history" className="bs-section">
        <h2 className="bs-section-title">History Buttons</h2>
        <p className="bs-section-source">components/HistoryPanel/HistoryEntry/HistoryEntry.scss</p>

        <div className="bs-grid">
          <div className="bs-item">
            <span className="bs-item-label">.action-icon-button</span>
            <UsageDetails usages={BUTTON_USAGE['action-icon-button']} />
            <div className="history-entry">
              <div className="actions-dropdown">
                <button className="action-icon-button icon-gray-hover-fill" type="button">
                  <Icon name="ellipsis-horizontal" variant="mini" size={20} color={ICON_GRAY} className="action-icon" />
                </button>
              </div>
            </div>
          </div>
          <div className="bs-item bs-item-wide">
            <span className="bs-item-label">Rename save/cancel</span>
            <UsageDetails usages={BUTTON_USAGE['rename-buttons-history']} />
            <div className="button-group" style={{ display: 'flex', gap: '8px' }}>
              <button className="button" type="button">Save</button>
              <button className="button outline" type="button">Cancel</button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 7: History Pagination */}
      {/* ================================================================ */}
      <section id="history-pagination" className="bs-section">
        <h2 className="bs-section-title">History Pagination</h2>
        <p className="bs-section-source">components/HistoryPanel/HistoryPanel.scss</p>
        <UsageDetails usages={BUTTON_USAGE['pagination']} />

        <div className="history-panel full-history">
          <Pagination className="history-pagination">
            <PaginationContent>
              <PaginationItem>
                <PaginationLink href="#" aria-label="Go to first page">
                  &laquo;
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" aria-label="Go to last page">
                  &raquo;
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 8: Credit Entry Buttons */}
      {/* ================================================================ */}
      <section id="credit-entry" className="bs-section">
        <h2 className="bs-section-title">Credit Entry Buttons</h2>
        <p className="bs-section-source">components/CreditsDisplay/CreditList/CreditEntry/CreditEntry.scss + CreditEntryDetails.scss</p>

        <div className="bs-grid">
          <div className="bs-item bs-item-wide">
            <span className="bs-item-label">.credit-usage-button</span>
            <UsageDetails usages={BUTTON_USAGE['credit-usage-button']} />
            <div className="credit-entry-row">
              <div className="credit-controls">
                <div className="credit-usage" style={{ '--button-hover-bg': 'rgba(34, 204, 157, 0.1)' } as React.CSSProperties}>
                  <button className="credit-usage-button" type="button">
                    <div className="credit-amount-large">$250 / $300</div>
                    <div className="credit-usage-label">
                      <Icon name="check-circle" variant="micro" size={14} style={{ color: COLORS.PRIMARY_COLOR }} />
                      <span>Partially Used</span>
                      <Icon name="chevron-down" variant="micro" size={12} />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="bs-item bs-item-wide">
            <span className="bs-item-label">.credit-usage-button (static)</span>
            <div className="credit-entry-row">
              <div className="credit-controls">
                <div className="credit-usage">
                  <button className="credit-usage-button static" type="button">
                    <div className="credit-amount-large">$100 / $100</div>
                    <div className="credit-usage-label">
                      <Icon name="check-circle" variant="micro" size={14} style={{ color: COLORS.PRIMARY_COLOR }} />
                      <span>Fully Used</span>
                      <Icon name="chevron-down" variant="micro" size={12} />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="bs-item bs-item-wide">
            <span className="bs-item-label">Modal controls button</span>
            <UsageDetails usages={BUTTON_USAGE['credit-modal-controls']} />
            <div className="credit-modal-controls" style={{ '--usage-tint-hover': 'rgba(34, 204, 157, 0.15)' } as React.CSSProperties}>
              <div className="credit-usage">
                <button type="button">$150</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 9: Card Manager Buttons */}
      {/* ================================================================ */}
      <section id="card-manager" className="bs-section">
        <h2 className="bs-section-title">Card Manager Buttons</h2>
        <p className="bs-section-source">components/CreditCardManager/CreditCardManager.scss</p>
        <UsageDetails usages={BUTTON_USAGE['alert-dialog-card-manager']} />

        <div className="credit-card-manager">
          <div className="button-group" style={{ display: 'flex', gap: '8px' }}>
            <button className="button destructive" type="button">Remove</button>
            <button className="button outline" type="button">Cancel</button>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 10: Select Card Buttons */}
      {/* ================================================================ */}
      <section id="select-card" className="bs-section">
        <h2 className="bs-section-title">Select Card Buttons</h2>
        <p className="bs-section-source">components/ui/select-card/SelectCard.scss</p>

        <div className="bs-grid">
          <div className="bs-item bs-item-wide">
            <span className="bs-item-label">.select-card-button</span>
            <UsageDetails usages={BUTTON_USAGE['select-card-button']} />
            <div className="select-different-card">
              <button className="select-card-button" type="button">
                <Icon name="card" variant="micro" color={ICON_GRAY} size={14} />
                <span className="label-text">Select Card</span>
              </button>
            </div>
          </div>
          <div className="bs-item bs-item-wide">
            <span className="bs-item-label">.select-card-button (loading)</span>
            <div className="select-different-card">
              <button className="select-card-button loading" type="button" disabled>
                Loading...
              </button>
            </div>
          </div>
          <div className="bs-item bs-item-wide">
            <span className="bs-item-label">.selected-card-button + .deselect-button</span>
            <UsageDetails usages={BUTTON_USAGE['selected-card-button']} />
            <div className="select-different-card">
              <div className="selected-card-container" style={{ display: 'flex' }}>
                <button className="selected-card-button" type="button">
                  <span className="selected-card-name">Amex Gold</span>
                </button>
                <button className="deselect-button" type="button" aria-label="Deselect card">&#10005;</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 11: Tab Bar */}
      {/* ================================================================ */}
      <section id="tab-bar" className="bs-section">
        <h2 className="bs-section-title">Tab Bar</h2>
        <p className="bs-section-source">elements/TabBar/TabBar.scss</p>

        <div className="ds-variant-group">
          <h3 className="ds-variant-label">Tab Bar</h3>
          <UsageDetails usages={BUTTON_USAGE['tab-bar-button']} />
          <div className="tab-bar" style={{ display: 'flex' }}>
            <button className="tab-bar-button active" type="button">Active Tab</button>
            <button className="tab-bar-button" type="button">Inactive Tab</button>
            <button className="tab-bar-button" type="button">Another Tab</button>
          </div>
        </div>

        <div className="ds-variant-group">
          <h3 className="ds-variant-label">Tab Bar (small)</h3>
          <div className="tab-bar small" style={{ display: 'flex' }}>
            <button className="tab-bar-button active" type="button">Active</button>
            <button className="tab-bar-button" type="button">Inactive</button>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 12: Utility Buttons */}
      {/* ================================================================ */}
      <section id="utility" className="bs-section">
        <h2 className="bs-section-title">Utility Buttons</h2>
        <p className="bs-section-source">Various component SCSS files</p>

        <div className="bs-grid">
          {/* Inline button */}
          <div className="bs-item bs-item-wide">
            <span className="bs-item-label">.inline-button</span>
            <span className="bs-item-class">PromptWindow.scss</span>
            <UsageDetails usages={BUTTON_USAGE['inline-button']} />
            <div className="below-prompt-field-text">
              <button className="inline-button" type="button">Inline Action</button>
            </div>
          </div>

          {/* Regenerate button */}
          <div className="bs-item bs-item-wide">
            <span className="bs-item-label">.daily-digest__regenerate-button</span>
            <span className="bs-item-class">DailyDigest.scss</span>
            <UsageDetails usages={BUTTON_USAGE['daily-digest__regenerate-button']} />
            <div className="daily-digest">
              <div className="daily-digest__footer">
                <button className="daily-digest__regenerate-button" type="button">
                  <Icon name="arrow-refresh" variant="micro" size={12} />
                  Regenerate
                </button>
              </div>
            </div>
          </div>

          {/* Date picker buttons */}
          <div className="bs-item">
            <span className="bs-item-label">.date-picker-clear</span>
            <span className="bs-item-class">DatePicker.scss</span>
            <UsageDetails usages={BUTTON_USAGE['date-picker-clear']} />
            <div className="date-picker-actions" style={{ display: 'flex', gap: '4px' }}>
              <button className="date-picker-clear" type="button">
                <Icon name="x-mark" variant="mini" size={14} color={ICON_GRAY} />
              </button>
              <button className="date-picker-calendar-btn" type="button">
                <Icon name="calendar" variant="mini" size={16} />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 13: Help Page Buttons */}
      {/* ================================================================ */}
      <section id="help" className="bs-section">
        <h2 className="bs-section-title">Help Page Buttons</h2>
        <p className="bs-section-source">pages/help/Help.scss</p>

        <div className="bs-grid">
          <div className="bs-item bs-item-wide">
            <span className="bs-item-label">button.help-layout__mobile-toggle</span>
            <span className="bs-item-class">all: unset !important</span>
            <UsageDetails usages={BUTTON_USAGE['help-layout__mobile-toggle']} />
            <button className="help-layout__mobile-toggle" type="button">
              <Icon name="bars-3" variant="mini" size={20} color={ICON_GRAY} />
              <span>Help Center Navigation</span>
              <Icon name="chevron-down" variant="mini" size={16} color={ICON_GRAY} className="help-layout__mobile-toggle-chevron" />
            </button>
          </div>
          <div className="bs-item bs-item-wide">
            <span className="bs-item-label">button.help-nav-section__header</span>
            <span className="bs-item-class">all: unset !important</span>
            <UsageDetails usages={BUTTON_USAGE['help-nav-section__header']} />
            <div className="help-nav-section">
              <button className="help-nav-section__header" type="button">
                <span className="help-nav-section__title">Getting Started</span>
                <Icon name="chevron-down" variant="mini" size={14} color={ICON_GRAY} className="help-nav-section__chevron" />
              </button>
            </div>
          </div>
          <div className="bs-item bs-item-wide">
            <span className="bs-item-label">button.help-section__header</span>
            <span className="bs-item-class">all: unset !important</span>
            <UsageDetails usages={BUTTON_USAGE['help-section__header']} />
            <div className="help-section">
              <button className="help-section__header" type="button">
                <h3 className="help-section__title">FAQ Section Title</h3>
                <Icon name="chevron-down" variant="mini" size={16} color={ICON_GRAY} className="help-section__chevron" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 14: Dialog Footer Buttons */}
      {/* ================================================================ */}
      <section id="dialog-footer" className="bs-section">
        <h2 className="bs-section-title">Dialog Footer Buttons</h2>
        <p className="bs-section-source">components/ui/dialog/dialog.scss</p>
        <UsageDetails usages={BUTTON_USAGE['dialog-footer-buttons']} />

        <div className="ds-variant-group">
          <h3 className="ds-variant-label">Button Group in Footer</h3>
          <div className="dialog-footer" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px 24px' }}>
            <div className="button-group">
              <button className="button" type="button">Confirm</button>
              <button className="button outline" type="button">Cancel</button>
            </div>
          </div>
        </div>

        <div className="ds-variant-group">
          <h3 className="ds-variant-label">Direct Button in Footer</h3>
          <div className="dialog-footer" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px 24px' }}>
            <button className="button" type="button">Save Changes</button>
          </div>
        </div>

        <div className="ds-variant-group">
          <h3 className="ds-variant-label">Destructive Dialog (AlertDialogAction)</h3>
          <div className="dialog-footer" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px 24px' }}>
            <div className="button-group">
              <button className="button destructive" type="button">Delete</button>
              <button className="button outline" type="button">Cancel</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ButtonsShowcase;
