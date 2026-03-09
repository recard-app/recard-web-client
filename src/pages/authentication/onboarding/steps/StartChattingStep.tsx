import React from 'react';
import { Icon } from '../../../../icons';

interface StartChattingStepProps {
  onComplete: (initialPrompt?: string) => void;
}

const EXAMPLE_PROMPTS = [
  "Which card should I use for groceries?",
  "What credits do I have expiring soon?",
  "Mark my Uber credit as used",
  "Help me pick a card for travel",
];

const StartChattingStep: React.FC<StartChattingStepProps> = ({ onComplete }) => {
  return (
    <div className="onboarding-step">
      <div>
        <h2 className="onboarding-step__title">You're All Set</h2>
        <p className="onboarding-step__subtitle">
          Your personal credit card assistant is ready. Ask which card to use at checkout, track credits and expiration dates, mark credits as used, or get tailored spending strategies. Here are some things you can ask:
        </p>
      </div>

      <div className="onboarding-prompts">
        {EXAMPLE_PROMPTS.map((prompt, i) => (
          <div key={i} className="onboarding-prompt-card onboarding-prompt-card--static">
            <p className="onboarding-prompt-card__text">{prompt}</p>
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
