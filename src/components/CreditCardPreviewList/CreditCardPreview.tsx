import React from 'react';
import { CreditCard } from '../../types/CreditCardTypes';
import { PLACEHOLDER_CARD_IMAGE } from '../../types';
import './CreditCardPreviewList.scss';

interface CreditCardPreviewProps {
  card: CreditCard;
  isSelected?: boolean;
  onCardSelect?: (card: CreditCard) => void;
}

const CreditCardPreview: React.FC<CreditCardPreviewProps> = ({
  card,
  isSelected = false,
  onCardSelect,
}) => {
  const handleClick = () => {
    if (onCardSelect) {
      onCardSelect(card);
    }
  };

  return (
    <div 
      className={`credit-card-preview ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <div className="card-content">
        <img 
          src={card.CardImage || PLACEHOLDER_CARD_IMAGE} 
          alt={`${card.CardName} card`} 
          className="card-thumbnail"
        />
        <div className="card-info">
          <div className="card-name">
            {card.CardName}
            {card.isDefaultCard && <span className="preferred-card-tag">Preferred Card</span>}
          </div>
          <div className="card-issuer">{card.CardIssuer}</div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardPreview; 