import React from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { Icon } from '../../../../icons';

const WelcomeStep: React.FC = () => {
  const { user } = useAuth();

  const greeting = user?.displayName
    ? `Hi ${user.displayName}!`
    : 'Welcome!';

  return (
    <div className="onboarding-step">
      <div>
        <h2 className="onboarding-step__title">{greeting}</h2>
        <p className="onboarding-step__subtitle">
          Let's get you set up so you can maximize your credit card rewards.
        </p>
      </div>

      <div className="onboarding-value-cards">
        <div className="onboarding-value-card">
          <div className="onboarding-value-card__icon">
            <Icon name="chat-bubble" variant="mini" size={24} />
          </div>
          <h3 className="onboarding-value-card__title">Smart Recommendations</h3>
          <p className="onboarding-value-card__description">
            Ask which card to use for any purchase and get instant answers.
          </p>
        </div>

        <div className="onboarding-value-card">
          <div className="onboarding-value-card__icon">
            <Icon name="banknotes" variant="mini" size={24} />
          </div>
          <h3 className="onboarding-value-card__title">Credit Tracking</h3>
          <p className="onboarding-value-card__description">
            Never miss a card credit. Track usage and expiration dates.
          </p>
        </div>

        <div className="onboarding-value-card">
          <div className="onboarding-value-card__icon">
            <Icon name="star" variant="mini" size={24} />
          </div>
          <h3 className="onboarding-value-card__title">Personalized to You</h3>
          <p className="onboarding-value-card__description">
            Tailored to your exact cards, spending, and preferences.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeStep;
