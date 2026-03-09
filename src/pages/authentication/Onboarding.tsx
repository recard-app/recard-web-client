import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { PAGES } from '../../types/Pages';
import { useFullHeight } from '../../hooks/useFullHeight';
import { useOnboardingState } from '../../hooks/useOnboardingState';
import OnboardingWizard from './onboarding/OnboardingWizard';
import type { CreditCard } from '../../types/CreditCardTypes';
import type { PrioritizedCredit } from '../../types/CardCreditsTypes';
import './Onboarding.scss';

interface OnboardingProps {
  onModalOpen: () => void;
  creditCards: CreditCard[];
  prioritizedCredits: PrioritizedCredit[];
  isLoadingPrioritizedCredits: boolean;
  onCardClick: (cardId: string) => void;
  onCreditClick: (cardId: string, creditId: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({
  onModalOpen,
  creditCards,
  prioritizedCredits,
  isLoadingPrioritizedCredits,
  onCardClick,
  onCreditClick,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOnboardingComplete, markOnboardingComplete } = useOnboardingState(user?.uid);

  useFullHeight(true);

  // Redirect to home if onboarding is already complete
  useEffect(() => {
    if (isOnboardingComplete) {
      navigate(PAGES.HOME.PATH, { replace: true });
    }
  }, [isOnboardingComplete, navigate]);

  const handleComplete = useCallback((initialPrompt?: string) => {
    markOnboardingComplete();
    if (initialPrompt) {
      navigate(PAGES.HOME.PATH, { state: { initialPrompt } });
    } else {
      navigate(PAGES.HOME.PATH);
    }
  }, [markOnboardingComplete, navigate]);

  if (isOnboardingComplete) {
    return null;
  }

  return (
    <OnboardingWizard
      onModalOpen={onModalOpen}
      creditCards={creditCards}
      prioritizedCredits={prioritizedCredits}
      isLoadingPrioritizedCredits={isLoadingPrioritizedCredits}
      onComplete={handleComplete}
      onCardClick={onCardClick}
      onCreditClick={onCreditClick}
    />
  );
};

export default Onboarding;
