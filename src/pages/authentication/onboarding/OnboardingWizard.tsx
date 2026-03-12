import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Icon } from '../../../icons';
import StepIndicator from './StepIndicator';
import WelcomeStep from './steps/WelcomeStep';
import SelectCardsStep from './steps/SelectCardsStep';
import CreditsPreviewStep from './steps/CreditsPreviewStep';
import InstallAppStep from './steps/InstallAppStep';
import VerifyEmailStep from './steps/VerifyEmailStep';
import StartChattingStep from './steps/StartChattingStep';
import type { CreditCard } from '../../../types/CreditCardTypes';
import type { PrioritizedCredit } from '../../../types/CardCreditsTypes';

const TOTAL_STEPS = 6;

interface OnboardingWizardProps {
  onModalOpen: () => void;
  creditCards: CreditCard[];
  prioritizedCredits: PrioritizedCredit[];
  isLoadingPrioritizedCredits: boolean;
  onComplete: (initialPrompt?: string) => void;
  onCardClick: (cardId: string) => void;
  onCreditClick: (cardId: string, creditId: string) => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  onModalOpen,
  creditCards,
  prioritizedCredits,
  isLoadingPrioritizedCredits,
  onComplete,
  onCardClick,
  onCreditClick,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkOverflow = useCallback(() => {
    const el = contentRef.current;
    if (el) {
      setIsOverflowing(el.scrollHeight > el.clientHeight);
    }
  }, []);

  // Monitor body element for resize to detect overflow
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);
    return () => observer.disconnect();
  }, [checkOverflow]);

  const goNext = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
  }, []);

  const goBack = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  // Scroll to top and re-check overflow on step change
  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
    checkOverflow();
  }, [currentStep, checkOverflow]);

  const selectedCards = creditCards.filter(c => c.selected);
  const hasCards = selectedCards.length > 0;
  const isLastStep = currentStep === TOTAL_STEPS;
  const isFirstStep = currentStep === 1;
  const bottomCta: {
    iconName: React.ComponentProps<typeof Icon>['name'];
    label: string;
    onClick: () => void;
  } | null = currentStep === 2
    ? {
      iconName: 'card',
      label: 'Select Cards',
      onClick: onModalOpen,
    }
    : isLastStep
      ? {
        iconName: 'chat-bubble',
        label: 'Start Chatting',
        onClick: () => onComplete(),
      }
      : null;

  const stepHint: Record<number, string> = {
    4: 'You can install the app later from your account settings',
    5: 'You can verify your email later from your account settings',
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep />;
      case 2:
        return (
          <SelectCardsStep
            creditCards={creditCards}
            onCardClick={onCardClick}
          />
        );
      case 3:
        return (
          <CreditsPreviewStep
            prioritizedCredits={prioritizedCredits}
            isLoadingPrioritizedCredits={isLoadingPrioritizedCredits}
            hasCards={hasCards}
            creditCards={creditCards}
            onModalOpen={onModalOpen}
            onCreditClick={onCreditClick}
          />
        );
      case 4:
        return <InstallAppStep />;
      case 5:
        return <VerifyEmailStep />;
      case 6:
        return <StartChattingStep />;
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-wizard">
      <div className="onboarding-wizard__card">
        <div className="onboarding-wizard__body" ref={contentRef}>
          {renderStep()}
          {stepHint[currentStep] && (
            <p className="onboarding-wizard__hint">{stepHint[currentStep]}</p>
          )}
          {bottomCta && (
            <div className="onboarding-wizard__start-chatting-wrapper">
              <button className="onboarding-wizard__start-chatting" onClick={bottomCta.onClick}>
                <Icon name={bottomCta.iconName} variant="mini" size={20} />
                {bottomCta.label}
              </button>
            </div>
          )}
        </div>
        <div className={`onboarding-wizard__nav${isOverflowing ? ' onboarding-wizard__nav--shadow' : ''}`}>
          <button
            className="onboarding-footer__arrow"
            onClick={goBack}
            disabled={isFirstStep}
            aria-label="Previous step"
          >
            <Icon name="arrow-left" variant="mini" size={20} />
          </button>
          <StepIndicator totalSteps={TOTAL_STEPS} currentStep={currentStep} />
          {isLastStep ? (
            <div className="onboarding-footer__arrow" style={{ visibility: 'hidden' }} />
          ) : (
            <button
              className="onboarding-footer__arrow"
              onClick={goNext}
              aria-label="Next step"
            >
              <Icon name="arrow-left" variant="mini" size={20} style={{ transform: 'scaleX(-1)' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
