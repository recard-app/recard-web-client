import React from 'react';
import ChatCardComponent from '../../../../elements/ChatComponents/ChatCardComponent';
import { Icon } from '../../../../icons';
import { CHAT_COMPONENT_TYPES } from '../../../../types/ChatComponentTypes';
import type { CardComponentItem } from '../../../../types/ChatComponentTypes';
import type { CreditCard } from '../../../../types/CreditCardTypes';

interface SelectCardsStepProps {
  onModalOpen: () => void;
  creditCards: CreditCard[];
  onCardClick: (cardId: string) => void;
}

function toCardComponentItem(card: CreditCard, index: number): CardComponentItem {
  return {
    id: card.id,
    displayOrder: index,
    componentType: CHAT_COMPONENT_TYPES.CARD,
    card: {
      id: card.id,
      CardName: card.CardName,
      CardNetwork: card.CardNetwork,
      CardPrimaryColor: card.CardPrimaryColor || '#5A5F66',
      CardSecondaryColor: card.CardSecondaryColor || '#F2F4F6',
      frozen: card.isFrozen,
      preferred: card.isDefaultCard,
    },
  };
}

const SelectCardsStep: React.FC<SelectCardsStepProps> = ({ onModalOpen, creditCards, onCardClick }) => {
  const selectedCards = creditCards.filter(c => c.selected);
  const hasCards = selectedCards.length > 0;

  return (
    <div className="onboarding-step">
      <div>
        <h2 className="onboarding-step__title">Select Your Cards</h2>
        <p className="onboarding-step__subtitle">
          Add the credit cards you own to get personalized recommendations.
        </p>
      </div>

      {hasCards ? (
        <>
          <div className="onboarding-component-list">
            {selectedCards.map((card, i) => (
              <ChatCardComponent
                key={card.id}
                item={toCardComponentItem(card, i)}
                onCardClick={onCardClick}
                canUndo={false}
              />
            ))}
          </div>
          <button className="button icon with-text" style={{ alignSelf: 'flex-start' }} onClick={onModalOpen}>
            <Icon name="card" variant="mini" size={18} />
            Select Cards
          </button>
        </>
      ) : (
        <button className="button" onClick={onModalOpen}>
          Select Your Credit Cards
        </button>
      )}
    </div>
  );
};

export default SelectCardsStep;
