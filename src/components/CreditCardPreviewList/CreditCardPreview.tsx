import React from 'react';
import { CreditCard } from '../../types/CreditCardTypes';
import { PLACEHOLDER_CARD_IMAGE, ICON_PRIMARY } from '../../types';
import { Icon } from '../../icons';
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
            {card.isDefaultCard && (
              <Icon 
                name="star" 
                variant="mini" 
                size={16} 
                color={ICON_PRIMARY} 
                className="preferred-star-icon"
              />
            )}
            {card.CardName}
          </div>
          <div className="card-issuer">{card.CardIssuer}</div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardPreview; 