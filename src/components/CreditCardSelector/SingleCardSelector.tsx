import React, { useState, useEffect } from 'react';
import './CreditCardSelector.scss';
import { CreditCard } from '../../types/CreditCardTypes';
import { filterCards, fetchUserCards, sortCards } from './utils';
import { PLACEHOLDER_CARD_IMAGE } from '../../types';

/**
 * Props interface for the SingleCardSelector component
 * @property creditCards - Array of available credit cards
 * @property onSelectCard - Callback function when a card is selected
 * @property selectedCardId - Currently selected card ID (if any)
 * @property showOnlyUnselectedCards - When true, only shows cards that aren't in the user's collection and hides section headers
 */
interface SingleCardSelectorProps {
  creditCards: CreditCard[];
  onSelectCard: (card: CreditCard) => void;
  selectedCardId?: string;
  showOnlyUnselectedCards?: boolean;
}

/**
 * Component for selecting a single credit card
 * Similar to CreditCardSelector but focused on single selection
 */
const SingleCardSelector: React.FC<SingleCardSelectorProps> = ({
  creditCards,
  onSelectCard,
  selectedCardId,
  showOnlyUnselectedCards = false
}) => {
  // State for managing the list of all credit cards, initialized with sorted existing cards
  const [cards, setCards] = useState<CreditCard[]>(sortCards(creditCards || []));
  // State for managing the search input value
  const [searchTerm, setSearchTerm] = useState<string>('');
  // State for tracking if we're loading initial data
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(cards.length === 0);

  /**
   * Fetch cards and organize them in the background
   * Shows existing cards immediately while fetching updated data
   */
  useEffect(() => {
    const loadCards = async () => {
      try {
        const fetchedCards = await fetchUserCards(cards);
        setCards(fetchedCards);
        setIsInitialLoad(false);
      } catch (error) {
        console.error('Error loading cards:', error);
        setIsInitialLoad(false);
      }
    };

    loadCards();
  }, [creditCards, selectedCardId]);

  /**
   * Handle card selection
   */
  const handleCardClick = (card: CreditCard): void => {
    onSelectCard(card);
  };

  // Get filtered cards based on search term
  const filteredCards = filterCards(cards, searchTerm);
  
  // Split cards into "Your Cards" and "Other Cards"
  // "Your Cards" = cards with selected=true in their profile
  const userCards = filteredCards.filter(card => card.selected);
  
  // All other cards (not selected in user profile)
  let otherCards = filteredCards.filter(card => !card.selected);
  
  // Determine section header for non-selected cards
  const otherCardsHeader = userCards.length > 0 ? "Other Cards" : "All Cards";
  
  // If the currently selected card is in the "Other Cards" list, sort it to the top
  if (selectedCardId) {
    otherCards = otherCards.sort((a, b) => {
      if (a.id === selectedCardId) return -1;
      if (b.id === selectedCardId) return 1;
      return 0;
    });
  }

  // Determine which cards to display based on the showOnlyUnselectedCards prop
  const cardsToDisplay = showOnlyUnselectedCards ? otherCards : null;

  // Render a single card
  const renderCard = (card: CreditCard) => (
    <div 
      key={card.id} 
      className={`card selectable-card ${card.id === selectedCardId ? 'selected-card' : ''}`}
      onClick={() => handleCardClick(card)}
    >
      <div className='card-content'>
        <img 
          src={card.CardImage || PLACEHOLDER_CARD_IMAGE} 
          alt={`${card.CardName} card`} 
        />
        <div className='card-desc'>
          <p className='card-name'>
            {card.CardName}
            {card.isDefaultCard && <span className="default-tag">Preferred Card</span>}
          </p>
          <p className='card-type'>{card.CardIssuer}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className='credit-card-selector single-card-selector'>
      <div className="selector-header">
        <h3>Select a Card</h3>
      </div>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search cards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      {isInitialLoad && (
        <div className="loading">Loading cards...</div>
      )}
      
      <div className="cards-container">
        {/* When showing only unselected cards, we just render them directly without sections */}
        {showOnlyUnselectedCards ? (
          <div className="section-cards">
            {otherCards.map(renderCard)}
            {otherCards.length === 0 && !isInitialLoad && (
              <div className="no-results">No cards available to add</div>
            )}
          </div>
        ) : (
          <>
            {userCards.length > 0 && (
              <div className="card-section">
                <h4 className="section-header">My Cards</h4>
                <div className="section-cards">
                  {userCards.map(renderCard)}
                </div>
              </div>
            )}
            
            {otherCards.length > 0 && (
              <div className="card-section">
                <h4 className="section-header">{otherCardsHeader}</h4>
                <div className="section-cards">
                  {otherCards.map(renderCard)}
                </div>
              </div>
            )}
          </>
        )}
        
        {filteredCards.length === 0 && !isInitialLoad && !showOnlyUnselectedCards && (
          <div className="no-results">No cards match your search</div>
        )}
      </div>
    </div>
  );
};

export default SingleCardSelector;
