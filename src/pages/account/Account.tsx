import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
// Dialog imports no longer needed here
import { SubscriptionPlan, PAGE_NAMES, PAGE_ICONS } from '../../types';
import { SHOW_SUBSCRIPTION_MENTIONS } from '../../types';
import { 
  handleVerificationEmail as handleVerificationEmailUtil,
} from './utils';
import PageHeader from '../../components/PageHeader';
import { useScrollHeight } from '../../hooks/useScrollHeight';
import { InfoDisplay } from '../../elements';
import './Account.scss';
import ContentContainer from '../../components/ContentContainer';
import { PAGES } from '../../types/Pages';
import { Link } from 'react-router-dom';

/**
 * Props for the Account component
 * @interface AccountProps
 * @property {React.Dispatch<React.SetStateAction<ChatHistory>>} setChatHistory - Function to update the chat history state
 * @property {React.Dispatch<React.SetStateAction<number>>} setHistoryRefreshTrigger - Function to trigger a refresh of the chat history
 * @property {SubscriptionPlan} subscriptionPlan - The user's current subscription plan ('free' or 'premium')
 */
interface AccountProps {
  subscriptionPlan: SubscriptionPlan;
}

const Account: React.FC<AccountProps> = ({ subscriptionPlan }) => {
  const { user, sendVerificationEmail } = useAuth();
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  // Delete moved to dedicated page

  // Use the scroll height hook for this page
  useScrollHeight(true);

  const handleVerificationEmailClick = async (): Promise<void> => {
    const result = await handleVerificationEmailUtil(sendVerificationEmail);
    setMessageType(result.messageType);
    setMessage(result.message);
  };

  // Delete all chat moved to dedicated page

  // formatDateTime removed; meta block not displayed

  return (
    <div className="full-page-layout">
      <PageHeader title={PAGE_NAMES.MY_ACCOUNT} icon={PAGE_ICONS.MY_ACCOUNT.MINI} />
      <div className="full-page-content">
        <ContentContainer size="lg" framed>
        {user ? (
          <div className="account-wrapper">
            <div className="account-header">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  className="avatar"
                />
              )}
              <div className="identity">
                <h2 className="name">{user.displayName || 'My Account'}</h2>
                <p className="email">{user.email}</p>
                <div className="badges">
                  <span className={`badge ${user.emailVerified ? 'badge--success' : 'badge--warning'}`}>
                    {user.emailVerified ? 'Email Verified' : 'Email Not Verified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Meta removed per request */}

            <div className="account-sections">
              {SHOW_SUBSCRIPTION_MENTIONS && (
                <section className="section plan-section">
                  <h3 className="section-title">Your Plan</h3>
                  <div className="plan-row">
                    <span className="plan-tag">{subscriptionPlan}</span>
                    <p className="plan-copy">You are currently on the {subscriptionPlan} plan.</p>
                  </div>
                </section>
              )}
              {!user.emailVerified && (
                <section className="section callout callout--warning">
                  <h3 className="section-title">Verify your email</h3>
                  <p>
                    To unlock full capabilities and improve your account security, please verify your email address.
                  </p>
                  <div className="actions">
                    <button className="verify-button" onClick={handleVerificationEmailClick}>
                      Send Verification Email
                    </button>
                  </div>
                  {message && (
                    <InfoDisplay type={messageType || 'info'} message={message} />
                  )}
                </section>
              )}

              <section className="section">
                <p className="danger-link-copy">Need to delete your chat history?</p>
                <Link className="link" to={PAGES.DELETE_HISTORY.PATH}>Delete your chat history</Link>
              </section>

              <section className="section">
                <p className="danger-link-copy">Want to revisit onboarding?</p>
                <Link className="link" to={PAGES.WELCOME.PATH}>Revisit onboarding</Link>
              </section>
            </div>
          </div>
        ) : (
          <p>Please sign in to view your account details.</p>
        )}
        </ContentContainer>
      </div>
    </div>
  );
}

export default Account;
