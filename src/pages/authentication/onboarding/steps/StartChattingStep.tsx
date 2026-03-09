import React from 'react';
import { Icon } from '../../../../icons';
import OnboardingHeader from '../OnboardingHeader';

interface StartChattingStepProps {
  onComplete: (initialPrompt?: string) => void;
}

const EXAMPLE_PROMPTS = [
  { text: "Which card should I use for groceries?", icon: "card" },
  { text: "What credits do I have expiring soon?", icon: "clock" },
  { text: "Mark my Uber credit as used", icon: "check-circle" },
  { text: "Help me pick a card for travel", icon: "globe-alt" },
];

const StartChattingStep: React.FC<StartChattingStepProps> = ({ onComplete }) => {
  return (
    <div className="onboarding-step">
      <OnboardingHeader
        icon="chat-bubble"
        title="You're All Set"
        description="Your personal credit card assistant is ready. Ask which card to use at checkout, track credits and expiration dates, mark credits as used, or get tailored spending strategies. Here are some things you can ask:"
      />

      <div className="onboarding-prompts">
        {EXAMPLE_PROMPTS.map((prompt, i) => (
          <div key={i} className="onboarding-prompt-card onboarding-prompt-card--static">
            <div className="onboarding-prompt-card__icon">
              <Icon name={prompt.icon} variant="mini" size={16} />
            </div>
            <p className="onboarding-prompt-card__text">{prompt.text}</p>
          </div>
        ))}
      </div>

      <button className="button icon with-text" style={{ alignSelf: 'flex-start' }} onClick={() => onComplete()}>
        <Icon name="chat-bubble" variant="mini" size={18} />
        Start Chatting
      </button>
    </div>
  );
};

export default StartChattingStep;
