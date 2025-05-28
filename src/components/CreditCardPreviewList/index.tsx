import React from 'react';
import { CreditCard } from '../../types/CreditCardTypes';
import CreditCardPreview from './CreditCardPreview';
import './CreditCardPreviewList.scss';

interface CreditCardPreviewListProps {
  cards: CreditCard[];
  selectedCardId?: string;
  onCardSelect?: (card: CreditCard) => void;
  loading?: boolean;
  showOnlySelected?: boolean;
}

// Helper function to sort credit cards (default card first, then alphabetically)
export const sortCreditCards = (cards: CreditCard[]): CreditCard[] => {
  return [...cards].sort((a, b) => {
    // Sort default card first
    if (a.isDefaultCard !== b.isDefaultCard) {
      return a.isDefaultCard ? -1 : 1;
    }
    // Then sort alphabetically by name
    return a.CardName.localeCompare(b.CardName);
  });
};

const CreditCardPreviewList: React.FC<CreditCardPreviewListProps> = ({
  cards,
  selectedCardId,
  onCardSelect,
  loading = false,
  showOnlySelected = false,
}) => {
  // Filter cards if showOnlySelected is true
  const displayCards = showOnlySelected 
    ? cards.filter(card => card.selected)
    : cards;
    
  // Sort cards: default card first, then alphabetically
  const sortedCards = sortCreditCards(displayCards);

  return (
    <div className="cards-list">
      {loading ? (
        <div className="loading-cards">Loading cards...</div>
      ) : sortedCards.length === 0 ? (
        <div className="no-cards">
          <p>You haven't added any cards yet.</p>
        </div>
      ) : (
        sortedCards.map(card => (
          <CreditCardPreview
            key={card.id}
            card={card}
            isSelected={selectedCardId === card.id}
            onCardSelect={onCardSelect}
          />
        ))
      )}
    </div>
  );
};

export default CreditCardPreviewList;