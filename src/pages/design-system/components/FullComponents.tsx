import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Components
import HistoryEntry from '../../../components/HistoryPanel/HistoryEntry';
import CreditCardPreview from '../../../components/CreditCardPreviewList/CreditCardPreview';
import CreditSummary from '../../../components/CreditSummary';
import CreditEntry from '../../../components/CreditsDisplay/CreditList/CreditEntry';
import CreditCardSelector from '../../../components/CreditCardSelector';
import SingleCardSelector from '../../../components/CreditCardSelector/SingleCardSelector';
import { SelectCard } from '../../../components/ui/select-card/select-card';
import PromptSolution from '../../../components/PromptWindow/PromptSolution';
import PromptHistory from '../../../components/PromptWindow/PromptHistory';
import { CardIcon, Icon } from '../../../icons';
import { CheckIcon } from 'lucide-react';

// Mock Data
import {
  mockCreditCards,
  mockCreditCardDetails,
  mockCardCredits,
  mockUserCredits,
  mockUserCreditsWithExpiration,
  mockConversations,
  mockMonthlyStats,
  mockMonthlyStatsEmpty,
  mockChatSolutions,
  mockChatMessages,
  getCardDetailsById,
  getCardCreditById,
  getCreditMaxValue,
} from './mock-data';

// Types
import { CreditCard, Conversation } from '../../../types';

// Styles
import '../DesignSystem.scss';
import './FullComponents.scss';

const FullComponents: React.FC = () => {
  const [isMobileView, setIsMobileView] = useState(false);
  const location = useLocation();

  // State for interactive demos
  const [selectedCardId, setSelectedCardId] = useState<string>('card-amex-gold');
  const [isCardSelectorOpen, setIsCardSelectorOpen] = useState(false);
  const [multiCardSelection, setMultiCardSelection] = useState(mockCreditCards.slice(0, 3));

  useEffect(() => {
    if (location.pathname.startsWith('/design-system')) {
      document.body.classList.add('design-system-body');
    }
    return () => {
      document.body.classList.remove('design-system-body');
    };
  }, [location.pathname]);

  // Mock handlers for interactive components
  const handleCardSelect = (card: CreditCard) => {
    setSelectedCardId(card.id);
    setIsCardSelectorOpen(false);
  };

  const handleHistoryUpdate = (chat: Conversation) => {
    console.log('History updated:', chat);
  };

  return (
    <div className="design-system-page full-components-page">
      <div className="ds-header">
        <h1>Full Components</h1>
        <div className="ds-header-actions">
          <div className="ds-viewport-toggle">
          <span className="ds-toggle-label">Preview:</span>
          <button
            className={`button small ${!isMobileView ? 'primary' : 'outline'}`}
            onClick={() => setIsMobileView(false)}
          >
            Desktop
          </button>
          <button
            className={`button small ${isMobileView ? 'primary' : 'outline'}`}
            onClick={() => setIsMobileView(true)}
          >
            Mobile
          </button>
          </div>
          <Link to="/design-system" className="ds-header-link">
            Design System
          </Link>
        </div>
      </div>

      <nav className="ds-nav">
        <a href="#history-entry">History Entry</a>
        <a href="#credit-card-preview">Credit Card Preview</a>
        <a href="#card-bubble">Card Bubble</a>
        <a href="#credit-summary">Credit Summary</a>
        <a href="#credit-entry">Credit Entry</a>
        <a href="#card-selector">Card Selector</a>
        <a href="#select-card">Select Card</a>
        <a href="#chat-solutions">Chat Solutions</a>
        <a href="#multi-card-selector">Multi Card Selector</a>
        <a href="#chat-bubbles">Chat Bubbles</a>
      </nav>

      <div className={`ds-preview-container ${isMobileView ? 'mobile' : 'desktop'}`}>
        
        {/* ================================================================ */}
        {/* HISTORY ENTRY SECTION */}
        {/* ================================================================ */}
        <section id="history-entry" className="ds-section">
          <h2 className="ds-section-title">History Entry</h2>
          <p className="ds-section-description">
            Chat history entries displayed in sidebar and full-page views
          </p>

          {/* Full Page Variant */}
          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Full Page Variant</h3>
            <span className="ds-component-class">variant="full-page"</span>
            <div className="ds-history-list">
              {mockConversations.slice(0, 3).map((conversation) => (
                <HistoryEntry
                  key={conversation.chatId}
                  chatEntry={conversation}
                  currentChatId="chat-1"
                  returnCurrentChatId={() => {}}
                  creditCards={mockCreditCards}
                  variant="full-page"
                />
              ))}
            </div>
          </div>

          {/* Sidebar Variant */}
          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Sidebar Variant</h3>
            <span className="ds-component-class">variant="sidebar"</span>
            <div className="ds-history-list sidebar-demo">
              {mockConversations.slice(0, 3).map((conversation) => (
                <HistoryEntry
                  key={conversation.chatId}
                  chatEntry={conversation}
                  currentChatId="chat-2"
                  returnCurrentChatId={() => {}}
                  creditCards={mockCreditCards}
                  variant="sidebar"
                />
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* CREDIT CARD PREVIEW SECTION */}
        {/* ================================================================ */}
        <section id="credit-card-preview" className="ds-section">
          <h2 className="ds-section-title">Credit Card Preview</h2>
          <p className="ds-section-description">
            Card preview components for different contexts
          </p>

          {/* Sidebar Variant */}
          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Sidebar Variant</h3>
            <span className="ds-component-class">variant="sidebar"</span>
            <div className="ds-card-list sidebar-demo">
              {mockCreditCards.slice(0, 3).map((card) => (
                <CreditCardPreview
                  key={card.id}
                  card={card}
                  isSelected={card.id === selectedCardId}
                  onCardSelect={handleCardSelect}
                  variant="sidebar"
                />
              ))}
            </div>
          </div>

          {/* My Cards Variant */}
          <div className="ds-variant-group">
            <h3 className="ds-variant-label">My Cards Variant</h3>
            <span className="ds-component-class">variant="my-cards"</span>
            <div className="ds-card-list my-cards-demo">
              {mockCreditCards.slice(0, 3).map((card) => (
                <CreditCardPreview
                  key={card.id}
                  card={card}
                  isSelected={card.id === selectedCardId}
                  onCardSelect={handleCardSelect}
                  variant="my-cards"
                />
              ))}
            </div>
          </div>

          {/* Mobile Sidebar Variant */}
          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Mobile Sidebar Variant</h3>
            <span className="ds-component-class">variant="mobile-sidebar"</span>
            <div className="ds-card-list mobile-demo">
              {mockCreditCards.slice(0, 3).map((card) => (
                <CreditCardPreview
                  key={card.id}
                  card={card}
                  isSelected={card.id === selectedCardId}
                  onCardSelect={handleCardSelect}
                  variant="mobile-sidebar"
                />
              ))}
            </div>
          </div>

          {/* States */}
          <div className="ds-variant-group">
            <h3 className="ds-variant-label">States</h3>
            <div className="ds-component-grid">
              <div className="ds-component-item">
                <span className="ds-component-name">Default</span>
                <CreditCardPreview
                  card={mockCreditCards[1]}
                  isSelected={false}
                  variant="sidebar"
                />
              </div>
              <div className="ds-component-item">
                <span className="ds-component-name">Selected</span>
                <CreditCardPreview
                  card={mockCreditCards[1]}
                  isSelected={true}
                  variant="sidebar"
                />
              </div>
              <div className="ds-component-item">
                <span className="ds-component-name">With Default Star</span>
                <CreditCardPreview
                  card={mockCreditCards[0]}
                  isSelected={false}
                  variant="sidebar"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* CARD BUBBLE DISPLAY SECTION */}
        {/* ================================================================ */}
        <section id="card-bubble" className="ds-section">
          <h2 className="ds-section-title">Card Bubble Display</h2>
          <p className="ds-section-description">
            Small inline card name display with thumbnail icon
          </p>

          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Examples</h3>
            <span className="ds-component-class">class="card-bubble-display"</span>
            <div className="ds-component-grid">
              {mockCreditCards.slice(0, 4).map((card) => (
                <div className="ds-component-item" key={card.id}>
                  <span className="ds-component-name">{card.CardIssuer}</span>
                  <p className="card-bubble-display">
                    <CardIcon
                      title={card.CardName}
                      size={12}
                      primary={card.CardPrimaryColor}
                      secondary={card.CardSecondaryColor}
                      className="card-thumbnail"
                    />
                    {card.CardName}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* CREDIT SUMMARY SECTION */}
        {/* ================================================================ */}
        <section id="credit-summary" className="ds-section">
          <h2 className="ds-section-title">Credit Summary</h2>
          <p className="ds-section-description">
            Credit usage summary for header and sidebar contexts
          </p>

          {/* Header Variant */}
          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Header Variant</h3>
            <span className="ds-component-class">variant="header"</span>
            <div className="ds-credit-summary-demo">
              <CreditSummary
                variant="header"
                monthlyStats={mockMonthlyStats}
                loading={false}
                onDetailedSummaryClick={() => console.log('Detailed summary clicked')}
              />
            </div>
          </div>

          {/* Sidebar Variant */}
          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Sidebar Variant</h3>
            <span className="ds-component-class">variant="sidebar"</span>
            <div className="ds-credit-summary-demo sidebar-demo">
              <CreditSummary
                variant="sidebar"
                monthlyStats={mockMonthlyStats}
                loading={false}
              />
            </div>
          </div>

          {/* States */}
          <div className="ds-variant-group">
            <h3 className="ds-variant-label">States</h3>
            <div className="ds-states-list">
              <div className="ds-state-item">
                <span className="ds-component-name">Loading</span>
                <CreditSummary
                  variant="header"
                  monthlyStats={null}
                  loading={true}
                />
              </div>
              <div className="ds-state-item">
                <span className="ds-component-name">Error</span>
                <CreditSummary
                  variant="header"
                  monthlyStats={null}
                  loading={false}
                  error="Failed to load credit stats"
                />
              </div>
              <div className="ds-state-item">
                <span className="ds-component-name">No Data</span>
                <CreditSummary
                  variant="header"
                  monthlyStats={mockMonthlyStatsEmpty}
                  loading={false}
                />
              </div>
              <div className="ds-state-item">
                <span className="ds-component-name">Updating</span>
                <CreditSummary
                  variant="header"
                  monthlyStats={mockMonthlyStats}
                  loading={false}
                  isUpdating={true}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* CREDIT ENTRY SECTION */}
        {/* ================================================================ */}
        <section id="credit-entry" className="ds-section">
          <h2 className="ds-section-title">Credit Entry</h2>
          <p className="ds-section-description">
            Individual credit entries for the credits list
          </p>

          {/* Default Variant */}
          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Default Variant</h3>
            <span className="ds-component-class">variant="default"</span>
            <div className="ds-credit-list">
              {mockUserCreditsWithExpiration.slice(0, 3).map((userCredit) => (
                <CreditEntry
                  key={`${userCredit.CardId}-${userCredit.CreditId}`}
                  userCredit={userCredit}
                  now={new Date()}
                  card={getCardDetailsById(userCredit.CardId)}
                  cardCredit={getCardCreditById(userCredit.CreditId)}
                  creditMaxValue={getCreditMaxValue(userCredit.CreditId)}
                  variant="default"
                  disableDropdown={true}
                />
              ))}
            </div>
          </div>

          {/* Sidebar Variant */}
          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Sidebar Variant</h3>
            <span className="ds-component-class">variant="sidebar"</span>
            <div className="ds-credit-list sidebar-demo">
              {mockUserCreditsWithExpiration.slice(0, 3).map((userCredit) => (
                <CreditEntry
                  key={`${userCredit.CardId}-${userCredit.CreditId}-sidebar`}
                  userCredit={userCredit}
                  now={new Date()}
                  card={getCardDetailsById(userCredit.CardId)}
                  cardCredit={getCardCreditById(userCredit.CreditId)}
                  creditMaxValue={getCreditMaxValue(userCredit.CreditId)}
                  variant="sidebar"
                  disableDropdown={true}
                />
              ))}
            </div>
          </div>

          {/* Usage States */}
          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Usage States</h3>
            <div className="ds-credit-list">
              {mockUserCreditsWithExpiration.map((userCredit) => (
                <CreditEntry
                  key={`${userCredit.CardId}-${userCredit.CreditId}-states`}
                  userCredit={userCredit}
                  now={new Date()}
                  card={getCardDetailsById(userCredit.CardId)}
                  cardCredit={getCardCreditById(userCredit.CreditId)}
                  creditMaxValue={getCreditMaxValue(userCredit.CreditId)}
                  variant="default"
                  disableDropdown={true}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SINGLE CARD SELECTOR SECTION */}
        {/* ================================================================ */}
        <section id="card-selector" className="ds-section">
          <h2 className="ds-section-title">Single Card Selector</h2>
          <p className="ds-section-description">
            Card selection interface with search and sections
          </p>

          {/* Default */}
          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Default (All Cards)</h3>
            <span className="ds-component-class">{'<SingleCardSelector />'}</span>
            <div className="ds-card-selector-demo">
              <SingleCardSelector
                creditCards={mockCreditCards}
                onSelectCard={handleCardSelect}
                selectedCardId={selectedCardId}
              />
            </div>
          </div>

          {/* Only User Cards */}
          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Only User Cards</h3>
            <span className="ds-component-class">onlyShowUserCards={'{true}'}</span>
            <div className="ds-card-selector-demo">
              <SingleCardSelector
                creditCards={mockCreditCards}
                onSelectCard={handleCardSelect}
                selectedCardId={selectedCardId}
                onlyShowUserCards={true}
              />
            </div>
          </div>

          {/* Disabled */}
          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Disabled</h3>
            <span className="ds-component-class">disabled={'{true}'}</span>
            <div className="ds-card-selector-demo">
              <SingleCardSelector
                creditCards={mockCreditCards}
                onSelectCard={handleCardSelect}
                selectedCardId={selectedCardId}
                disabled={true}
              />
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* MULTI CARD SELECTOR SECTION */}
        {/* ================================================================ */}
        <section id="multi-card-selector" className="ds-section">
          <h2 className="ds-section-title">Multi Card Selector</h2>
          <p className="ds-section-description">
            Card management panel used when the user can toggle multiple cards at once.
          </p>

          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Card Management Panel</h3>
            <span className="ds-component-class">{'<CreditCardSelector />'}</span>
            <div className="ds-card-selector-demo">
              <CreditCardSelector
                returnCreditCards={(cards) => {
                  setMultiCardSelection(cards);
                  console.log('Multi-Card Selection', cards);
                }}
                existingCreditCards={multiCardSelection}
                showSaveButton={false}
                disableApiFetch={true}
                disableApiSave={true}
                hideInternalSearch={true}
                disableAuthCheck={true}
              />
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* SELECT CARD COMPONENT SECTION */}
        {/* ================================================================ */}
        <section id="select-card" className="ds-section">
          <h2 className="ds-section-title">Select Card</h2>
          <p className="ds-section-description">
            Inline card selection trigger component
          </p>

          <div className="ds-variant-group">
            <h3 className="ds-variant-label">States</h3>
            <div className="ds-component-grid-wide">
              <div className="ds-component-item-full">
                <span className="ds-component-name">Unselected</span>
                <SelectCard
                  creditCards={mockCreditCards}
                  onSelectCardClick={() => setIsCardSelectorOpen(true)}
                  onDeselectCard={() => {}}
                />
              </div>
              <div className="ds-component-item-full">
                <span className="ds-component-name">Selected</span>
                <SelectCard
                  selectedCardId={selectedCardId}
                  creditCards={mockCreditCards}
                  onSelectCardClick={() => setIsCardSelectorOpen(true)}
                  onDeselectCard={() => setSelectedCardId('')}
                />
              </div>
              <div className="ds-component-item-full">
                <span className="ds-component-name">Loading</span>
                <SelectCard
                  selectedCardId={selectedCardId}
                  creditCards={mockCreditCards}
                  isUpdating={true}
                  onSelectCardClick={() => {}}
                  onDeselectCard={() => {}}
                />
              </div>
              <div className="ds-component-item-full">
                <span className="ds-component-name">Expanded Style</span>
                <SelectCard
                  selectedCardId={selectedCardId}
                  creditCards={mockCreditCards}
                  onSelectCardClick={() => setIsCardSelectorOpen(true)}
                  onDeselectCard={() => setSelectedCardId('')}
                  className="expanded"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* CHAT SOLUTIONS SECTION */}
        {/* ================================================================ */}
        <section id="chat-solutions" className="ds-section">
          <h2 className="ds-section-title">Chat Solutions (PromptSolution)</h2>
          <p className="ds-section-description">
            Card recommendation solutions displayed in chat. Shows recommended cards with selection state.
          </p>

          {/* Solution Card States */}
          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Individual Solution Card States</h3>
            <span className="ds-component-class">class="solution-card"</span>
            <div className="ds-solutions-demo">
              <div className="solutions-container" style={{ padding: 0 }}>
                <div className="collapsible-content expanded" style={{ border: 'none' }}>
                  <div className="solution-cards">
                    {/* Unselected Card (Recommended) */}
                    <div className="solution-card">
                      <div className="card-checkbox-container">
                        <button className="use-card-button" aria-label="Select for purchase">
                          {/* Empty - unselected */}
                        </button>
                      </div>
                      <div className="card-content-container">
                        <div className="card-header">
                          <CardIcon 
                            title="American Express Gold" 
                            size={24} 
                            primary={mockCreditCards[0].CardPrimaryColor}
                            secondary={mockCreditCards[0].CardSecondaryColor}
                          />
                          <h3>
                            American Express Gold
                            <span className="recommended-badge">Recommended</span>
                          </h3>
                        </div>
                        <div className="card-content">
                          <div className="card-details">
                            <p>Dining: 4X points</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Selected Card */}
                    <div className="solution-card selected-card">
                      <div className="card-checkbox-container">
                        <button className="use-card-button selected" aria-label="Selected for purchase">
                          <CheckIcon size={16} />
                        </button>
                      </div>
                      <div className="card-content-container">
                        <div className="card-header">
                          <CardIcon 
                            title="Chase Sapphire Reserve" 
                            size={24} 
                            primary={mockCreditCards[1].CardPrimaryColor}
                            secondary={mockCreditCards[1].CardSecondaryColor}
                          />
                          <h3>Chase Sapphire Reserve</h3>
                        </div>
                        <div className="card-content">
                          <div className="card-details">
                            <p>Dining: 3X points</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Regular Unselected Card */}
                    <div className="solution-card">
                      <div className="card-checkbox-container">
                        <button className="use-card-button" aria-label="Select for purchase">
                          {/* Empty - unselected */}
                        </button>
                      </div>
                      <div className="card-content-container">
                        <div className="card-header">
                          <CardIcon 
                            title="Citi Premier" 
                            size={24} 
                            primary={mockCreditCards[2].CardPrimaryColor}
                            secondary={mockCreditCards[2].CardSecondaryColor}
                          />
                          <h3>Citi Premier</h3>
                        </div>
                        <div className="card-content">
                          <div className="card-details">
                            <p>Dining: 3X points</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Collapsed Header */}
          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Collapsed Header</h3>
            <span className="ds-component-class">class="solutions-header"</span>
            <div className="ds-solutions-demo">
              <div className="solutions-container" style={{ padding: 0 }}>
                <div className="solutions-header" style={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <div className="header-title">
                    <Icon 
                      name="card"
                      variant="mini"
                      color="#B5BBC2"
                      size={18}
                    />
                    <p className="caps-label">Select Card for Purchase</p>
                  </div>
                  <button className="collapse-button" aria-label="Expand solutions">
                    <Icon 
                      name="chevron-down"
                      variant="mini"
                      color="black"
                      size={18}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Expanded Header */}
          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Expanded Header</h3>
            <span className="ds-component-class">class="solutions-header" (expanded)</span>
            <div className="ds-solutions-demo">
              <div className="solutions-container" style={{ padding: 0 }}>
                <div className="solutions-header">
                  <div className="header-title">
                    <Icon 
                      name="card"
                      variant="mini"
                      color="#B5BBC2"
                      size={18}
                    />
                    <p className="caps-label">Select Card for Purchase</p>
                  </div>
                  <button className="collapse-button expanded" aria-label="Collapse solutions">
                    <Icon 
                      name="chevron-up"
                      variant="mini"
                      color="black"
                      size={18}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Full Component (Interactive) */}
          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Full Component (Interactive)</h3>
            <span className="ds-component-class">{'<PromptSolution />'}</span>
            <p className="ds-section-description" style={{ marginBottom: '16px', marginTop: '8px' }}>
              Note: Card selection in this demo won't persist as it requires API calls.
            </p>
            <div className="ds-solutions-demo">
              <PromptSolution
                promptSolutions={mockChatSolutions}
                creditCards={mockCreditCards}
                chatId="demo-chat"
                selectedCardId={selectedCardId}
                onHistoryUpdate={handleHistoryUpdate}
                chatHistory={[]}
              />
            </div>
          </div>

          {/* Select Different Card Button States */}
          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Select Different Card (in context)</h3>
            <span className="ds-component-class">{'<SelectCard className="expanded" />'}</span>
            <div className="ds-solutions-demo">
              <div className="solutions-container" style={{ padding: 0 }}>
                <div className="collapsible-content expanded" style={{ border: 'none', padding: '8px' }}>
                  <SelectCard
                    selectedCardId={selectedCardId}
                    creditCards={mockCreditCards}
                    onSelectCardClick={() => setIsCardSelectorOpen(true)}
                    onDeselectCard={() => setSelectedCardId('')}
                    selectLabel="Select a different card:"
                    className="expanded"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* CHAT BUBBLES SECTION */}
        {/* ================================================================ */}
        <section id="chat-bubbles" className="ds-section">
          <h2 className="ds-section-title">Chat Bubbles</h2>
          <p className="ds-section-description">
            Example back-and-forth between the user and assistant, rendered using the PromptHistory chat bubbles.
          </p>

          <div className="ds-variant-group">
            <h3 className="ds-variant-label">Sample Conversation</h3>
            <span className="ds-component-class">{'<PromptHistory />'}</span>
            <div className="ds-solutions-demo">
              <PromptHistory
                chatHistory={mockChatMessages}
                creditCards={mockCreditCards}
                onCardSelect={(blockId, cardId) => {
                  console.log('Card selected from chat bubble', blockId, cardId);
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FullComponents;

