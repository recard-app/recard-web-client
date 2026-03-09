import React from 'react';
import ChatCreditComponent from '../../../../elements/ChatComponents/ChatCreditComponent';
import { Icon } from '../../../../icons';
import { InfoDisplay } from '../../../../elements';
import OnboardingHeader from '../OnboardingHeader';
import { APP_NAME } from '../../../../types/Constants';
import { CHAT_COMPONENT_TYPES } from '../../../../types/ChatComponentTypes';
import type { CreditComponentItem } from '../../../../types/ChatComponentTypes';
import type { CreditCard } from '../../../../types/CreditCardTypes';
import type { PrioritizedCredit } from '../../../../types/CardCreditsTypes';

interface CreditsPreviewStepProps {
  prioritizedCredits: PrioritizedCredit[];
  isLoadingPrioritizedCredits: boolean;
  hasCards: boolean;
  creditCards: CreditCard[];
  onCreditClick: (cardId: string, creditId: string) => void;
  onModalOpen: () => void;
}

const MAX_CREDITS_SHOWN = 6;

function toCreditComponentItem(credit: PrioritizedCredit, card: CreditCard | undefined, index: number): CreditComponentItem {
  return {
    id: credit.id,
    displayOrder: index,
    componentType: CHAT_COMPONENT_TYPES.CREDIT,
    card: {
      id: credit.cardId,
      CardName: credit.cardName,
      CardPrimaryColor: card?.CardPrimaryColor || '#5A5F66',
      CardSecondaryColor: card?.CardSecondaryColor || '#F2F4F6',
    },
    cardCredit: {
      id: credit.CreditId,
      Title: credit.name,
      Value: credit.totalAmount,
      TimePeriod: credit.period,
    },
    userCredit: {
      AssociatedPeriod: credit.AssociatedPeriod,
      isAnniversaryBased: credit.isAnniversaryBased,
      anniversaryDate: credit.anniversaryDate,
    },
    creditMaxValue: credit.totalAmount,
    currentValueUsed: credit.usedAmount,
  };
}

const CreditsPreviewStep: React.FC<CreditsPreviewStepProps> = ({
  prioritizedCredits,
  isLoadingPrioritizedCredits,
  hasCards,
  creditCards,
  onCreditClick,
  onModalOpen,
}) => {
  const creditsToShow = prioritizedCredits.slice(0, MAX_CREDITS_SHOWN);
  const remainingCount = prioritizedCredits.length - MAX_CREDITS_SHOWN;

  return (
    <div className="onboarding-step">
      <OnboardingHeader
        icon="banknotes"
        title="Your Credits"
        description={`Your cards come with credits, benefits that save you money each billing period. ${APP_NAME} tracks them so you never leave money on the table.`}
      />

      {!hasCards ? (
        <>
          <InfoDisplay
            type="info"
            message="Add your cards to see if they come with any credits."
            showTitle={false}
          />
          <button className="button icon with-text" style={{ alignSelf: 'flex-start' }} onClick={onModalOpen}>
            <Icon name="card" variant="mini" size={18} />
            Select Cards
          </button>
        </>
      ) : isLoadingPrioritizedCredits ? (
        <InfoDisplay
          type="loading"
          message="Loading credits..."
          showTitle={false}
          transparent
          centered
        />
      ) : prioritizedCredits.length === 0 ? (
        <InfoDisplay
          type="info"
          message="None of your current cards have trackable credits. You can still use the chat to get card recommendations and spending advice."
          showTitle={false}
        />
      ) : (
        <>
          <div className="onboarding-component-list">
            {creditsToShow.map((credit, i) => {
              const card = creditCards.find(c => c.id === credit.cardId);
              return (
                <ChatCreditComponent
                  key={credit.id}
                  item={toCreditComponentItem(credit, card, i)}
                  onCreditClick={onCreditClick}
                  canUndo={false}
                />
              );
            })}
          </div>
          {remainingCount > 0 && (
            <div className="onboarding-credits-more">
              <p className="onboarding-credits-more__count">+ {remainingCount} more</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CreditsPreviewStep;
