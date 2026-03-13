import React from 'react';
import { CreditCard } from '../../types/CreditCardTypes';
import CreditCardPreview from './CreditCardPreview';
import CreditCardPreviewListSkeleton from './CreditCardPreviewListSkeleton';
import { InfoDisplay } from '../../elements';
import './CreditCardPreviewList.scss';

interface CreditCardPreviewListProps {
  cards: CreditCard[];
  selectedCardId?: string;
  onCardSelect?: (card: CreditCard) => void;
  loading?: boolean;
  showOnlySelected?: boolean;
  variant?: 'sidebar' | 'my-cards' | 'mobile-sidebar';
}

// Helper function to sort credit cards (frozen last, default card first, then alphabetically)
export const sortCreditCards = (cards: CreditCard[]): CreditCard[] => {
  return [...cards].sort((a, b) => {
    // Frozen cards go to bottom
    const aFrozen = a.isFrozen ?? false;
    const bFrozen = b.isFrozen ?? false;
    if (aFrozen !== bFrozen) {
      return aFrozen ? 1 : -1;
    }
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
  variant,
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
        <CreditCardPreviewListSkeleton count={3} variant={variant} />
      ) : sortedCards.length === 0 ? (
        <div className="no-cards">
          <InfoDisplay
            type="default"
            message="You haven't added any cards yet."
            showTitle={false}
            transparent={true}
            showIcon={false}
          />
        </div>
      ) : (
        sortedCards.map(card => (
          <CreditCardPreview
            key={card.id}
            card={card}
            isSelected={selectedCardId === card.id}
            onCardSelect={onCardSelect}
            variant={variant}
          />
        ))
      )}
    </div>
  );
};

export default CreditCardPreviewList;
