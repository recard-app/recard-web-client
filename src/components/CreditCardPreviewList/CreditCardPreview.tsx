import React from 'react';
import { CreditCard } from '../../types/CreditCardTypes';
import { Dropdown } from '../../elements/Elements';
import { PLACEHOLDER_CARD_IMAGE } from '../../types';
import './CreditCardPreviewList.scss';

interface CreditCardPreviewProps {
  card: CreditCard;
  isSelected?: boolean;
  onCardSelect?: (card: CreditCard) => void;
  showDropdown?: boolean;
  dropdownOptions?: React.ReactNode;
}

const CreditCardPreview: React.FC<CreditCardPreviewProps> = ({
  card,
  isSelected = false,
  onCardSelect,
  showDropdown = false,
  dropdownOptions,
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
      
      {showDropdown && dropdownOptions && (
        <Dropdown 
          trigger={<button className="card-menu-button">•••</button>}
          align="right"
          className="card-dropdown"
        >
          {dropdownOptions}
        </Dropdown>
      )}
    </div>
  );
};

export default CreditCardPreview; 