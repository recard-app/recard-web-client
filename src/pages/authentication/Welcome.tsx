import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PAGES, PAGE_NAMES, PAGE_ICONS } from '../../types';
import PageHeader from '../../components/PageHeader';
import ContentContainer from '../../components/ContentContainer';
import { useFullHeight } from '../../hooks/useFullHeight';
import { Icon } from '../../icons';
import './Welcome.scss';

interface WelcomeProps {
    onModalOpen: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onModalOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Use the full height hook to prevent double scroll
  useFullHeight(true);

  const greeting = user?.displayName
    ? `Hi ${user.displayName}!`
    : 'Welcome!';

  return (
    <div className="full-page-layout">
      <PageHeader title="Welcome" icon={PAGE_ICONS.WELCOME.MINI} />
      <div className="full-page-content">
        <ContentContainer size="md">
          <div className="welcome-wrapper">
            <div className="welcome-hero">
              <h2 className="welcome-title">{greeting}</h2>
              <p className="welcome-subtitle">
                Let's set up your account so you can get personalized, real-time recommendations on which card to use
                for every purchase and maximize your rewards.
              </p>
              <div className="welcome-actions">
                <button className="icon with-text" onClick={onModalOpen}>
                  <Icon name="card" variant="mini" size={16} />
                  <span>Select Your Credit Cards</span>
                </button>
                <button className="secondary icon with-text" onClick={() => navigate(PAGES.HOME.PATH)}>
                  <Icon name="chat-bubble" variant="mini" size={16} />
                  <span>{PAGE_NAMES.NEW_TRANSACTION_CHAT}</span>
                </button>
              </div>
            </div>

            <div className="welcome-sections">
              <section className="section">
                <h3 className="section-title">Getting Started</h3>
                <div className="steps-grid">
                  <div className="step-card">
                    <div className="step-card__header">
                      <h4 className="step-card__title">Step 1: Add your credit cards</h4>
                    </div>
                    <div className="step-card__content">
                      <p className="step-card__description">Select the cards you own to unlock personalized rewards guidance.</p>
                      <div className="card-actions">
                        <button className="icon with-text mini ghost" onClick={onModalOpen}>
                          <Icon name="card" variant="mini" size={16} />
                          <span>Add your cards</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="step-card">
                    <div className="step-card__header">
                      <h4 className="step-card__title">Step 2: Verify your email</h4>
                    </div>
                    <div className="step-card__content">
                      <p className="step-card__description">Improve account security and enable additional features.</p>
                      <p className="subtle">
                        Manage verification from your <Link to={PAGES.ACCOUNT.PATH}>account</Link>.
                      </p>
                    </div>
                  </div>

                  <div className="step-card">
                    <div className="step-card__header">
                      <h4 className="step-card__title">Step 3: Ask about any purchase</h4>
                    </div>
                    <div className="step-card__content">
                      <p className="step-card__description">Describe what you're buying; we'll recommend the best card instantly.</p>
                      <div className="card-actions">
                        <Link className="button icon with-text mini ghost" to={PAGES.HOME.PATH}>
                          <Icon name="chat-bubble" variant="mini" size={16} />
                          <span>Start a chat</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="step-card">
                    <div className="step-card__header">
                      <h4 className="step-card__title">Step 4: Stay on top of your credits</h4>
                    </div>
                    <div className="step-card__content">
                      <p className="step-card__description">Keep track of your card credits all in one place.</p>
                      <div className="card-actions">
                        <Link className="button icon with-text mini ghost" to={PAGES.MY_CREDITS.PATH}>
                          <Icon name="banknotes" variant="mini" size={16} />
                          <span>View my credits</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="section tips">
                <div className="tips__header">
                  <h3 className="tips__title">Pro Tips</h3>
                </div>
                <div className="tips__content">
                  <ul className="tips-list">
                    <li>Keep your card list up to date to maintain accurate recommendations.</li>
                    <li>Use preferences to tailor instructions and filter your history.</li>
                    <li>Star important chats to find them quickly later.</li>
                  </ul>
                  <div className="tip-actions">
                    <Link className="button icon with-text mini ghost" to={PAGES.PREFERENCES.PATH}>
                      <Icon name="preferences" variant="mini" size={16} />
                      <span>Adjust preferences</span>
                    </Link>
                  </div>
                </div>
              </section>

              <section className="section help-section">
                <div className="help-section__header">
                  <h3 className="help-section__title">Need Help?</h3>
                </div>
                <div className="help-section__content">
                  <p className="help-description">
                    Find answers to common questions and learn how to get the most out of your account.
                  </p>
                  <div className="help-actions">
                    <Link className="button icon with-text mini ghost" to={PAGES.HELP_CENTER.PATH}>
                      <Icon name="question-mark-circle" variant="mini" size={16} />
                      <span>Visit Help Center</span>
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </ContentContainer>
      </div>
    </div>
  );
};

export default Welcome;
