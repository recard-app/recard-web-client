import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PAGES, PAGE_ICONS, PAGE_NAMES } from '../../types';
import PageHeader from '../../components/PageHeader';
import ContentContainer from '../../components/ContentContainer';
import { useScrollHeight } from '../../hooks/useScrollHeight';
import { Icon } from '../../icons';
import './Welcome.scss';

interface WelcomeProps {
    onModalOpen: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onModalOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Match page scroll behavior used across pages
  useScrollHeight(true);

  const greeting = user?.displayName
    ? `Hi ${user.displayName}!`
    : 'Welcome!';

  return (
    <div className="full-page-layout">
      <PageHeader title="Welcome" icon={PAGE_ICONS.HOME.MINI} />
      <div className="full-page-content">
        <ContentContainer size="md">
          <div className="welcome-wrapper">
            <div className="welcome-hero">
              <h2 className="welcome-title">{greeting} 👋</h2>
              <p className="welcome-subtitle">
                Let’s set up your account so you can get personalized, real-time recommendations on which card to use
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
                    <h4>1. Add your credit cards</h4>
                    <p>Select the cards you own to unlock personalized rewards guidance.</p>
                    <div className="card-actions">
                      <button className="icon with-text mini ghost" onClick={onModalOpen}>
                        <Icon name="card" variant="mini" size={16} />
                        <span>Add your cards</span>
                      </button>
                    </div>
                  </div>

                  <div className="step-card">
                    <h4>2. Verify your email</h4>
                    <p>Improve account security and enable additional features.</p>
                    <p className="subtle">
                      Manage verification from your <Link to={PAGES.ACCOUNT.PATH}>account</Link>.
                    </p>
                  </div>

                  <div className="step-card">
                    <h4>3. Ask about any purchase</h4>
                    <p>Describe what you’re buying; we’ll recommend the best card instantly.</p>
                  </div>

                  <div className="step-card">
                    <h4>4. Track your history</h4>
                    <p>Review past chats and decisions to learn and optimize over time.</p>
                  </div>
                </div>
              </section>

              <section className="section tips">
                <h3 className="section-title">Pro tips</h3>
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
              </section>
            </div>
          </div>
        </ContentContainer>
      </div>
    </div>
  );
};

export default Welcome; 