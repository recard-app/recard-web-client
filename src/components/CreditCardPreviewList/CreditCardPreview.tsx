import React from 'react';
import { CreditCard } from '../../types/CreditCardTypes';
import { ICON_PRIMARY } from '../../types';
import { Icon, CardIcon } from '../../icons';
import './CreditCardPreviewList.scss';

interface CreditCardPreviewProps {
  card: CreditCard;
  isSelected?: boolean;
  onCardSelect?: (card: CreditCard) => void;
  variant?: 'sidebar' | 'my-cards';
}

const CreditCardPreview: React.FC<CreditCardPreviewProps> = ({
  card,
  isSelected = false,
  onCardSelect,
  variant,
}) => {
  const handleClick = () => {
    if (onCardSelect) {
      onCardSelect(card);
    }
  };

  const getVariantClass = () => {
    if (variant === 'sidebar') return 'sidebar-variant';
    if (variant === 'my-cards') return 'my-cards-variant';
    return '';
  };

  return (
    <div 
      className={`credit-card-preview ${isSelected ? 'selected' : ''} ${getVariantClass()}`}
      onClick={handleClick}
    >
      <div className="card-content">
        <CardIcon 
          title={`${card.CardName} card`} 
          size={36} 
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