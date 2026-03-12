import React from 'react';
import ChatCardComponent from '../../../../elements/ChatComponents/ChatCardComponent';
import { InfoDisplay } from '../../../../elements';
import OnboardingHeader from '../OnboardingHeader';
import { CHAT_COMPONENT_TYPES } from '../../../../types/ChatComponentTypes';
import type { CardComponentItem } from '../../../../types/ChatComponentTypes';
import type { CreditCard } from '../../../../types/CreditCardTypes';
import { Icon } from '../../../../icons';

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
  const header = (
    <OnboardingHeader
      icon="card"
      title="Select Your Cards"
      description="Add the credit cards you own to get personalized recommendations. You can also set a preferred card, which the assistant will default to when making suggestions."
    />
  );

  return (
    <div className="onboarding-step">
      {hasCards ? (
        <>
          <div className="onboarding-select-cards__header-with-edit">
            {header}
            <button className="button icon with-text" style={{ alignSelf: 'flex-start' }} onClick={onModalOpen}>
              <Icon name="card" variant="mini" size={18} />
              Edit Cards
            </button>
          </div>
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
        </>
      ) : (
        <>
          {header}
          <InfoDisplay
            type="info"
            message="No cards selected yet. Tap below to add your cards."
            showTitle={false}
          />
        </>
      )}
    </div>
  );
};

export default SelectCardsStep;
