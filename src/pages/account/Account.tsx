import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SubscriptionPlan, PAGE_NAMES, PAGE_ICONS } from '../../types';
import { SHOW_SUBSCRIPTION_MENTIONS } from '../../types';
import {
  handleVerificationEmail as handleVerificationEmailUtil,
} from './utils';
import PageHeader from '../../components/PageHeader';
import { useScrollHeight } from '../../hooks/useScrollHeight';
import { InfoDisplay } from '../../elements';
import { SettingsCard, SettingsRow } from '../../components/SettingsCard';
import ContentContainer from '../../components/ContentContainer';
import { PAGES } from '../../types/Pages';
import './Account.scss';

interface AccountProps {
  subscriptionPlan: SubscriptionPlan;
}

const Account: React.FC<AccountProps> = ({ subscriptionPlan }) => {
  const { user, sendVerificationEmail, logout } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isSigningOut, setIsSigningOut] = useState(false);

  useScrollHeight(true);

  const handleVerificationEmailClick = async (): Promise<void> => {
    const result = await handleVerificationEmailUtil(sendVerificationEmail);
    setMessageType(result.messageType);
    setMessage(result.message);
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      setIsSigningOut(true);
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
      setIsSigningOut(false);
    }
  };

  const getVerificationStatus = () => {
    if (user?.emailVerified) {
      return <span className="status-badge status-badge--success">Verified</span>;
    }
    return <span className="status-badge status-badge--warning">Not Verified</span>;
  };

  const getPlanBadge = () => {
    return (
      <span className={`status-badge status-badge--${subscriptionPlan === 'premium' ? 'premium' : 'default'}`}>
        {subscriptionPlan}
      </span>
    );
  };

  return (
    <div className="full-page-layout">
      <PageHeader title={PAGE_NAMES.MY_ACCOUNT} icon={PAGE_ICONS.MY_ACCOUNT.MINI} />
      <div className="full-page-content">
        <ContentContainer size="sm">
          {user ? (
            <div className="account-wrapper">
              {/* Profile Card */}
              <div className="profile-card">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    className="profile-card__avatar"
                  />
                ) : (
                  <div className="profile-card__avatar profile-card__avatar--placeholder">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                  </div>
                )}
                <div className="profile-card__info">
                  <h2 className="profile-card__name">{user.displayName || 'Account'}</h2>
                  <p className="profile-card__email">{user.email}</p>
                  <div className="profile-card__badges">
                    <span className={`badge ${user.emailVerified ? 'badge--success' : 'badge--warning'}`}>
                      {user.emailVerified ? 'Email Verified' : 'Email Not Verified'}
                    </span>
                    {SHOW_SUBSCRIPTION_MENTIONS && (
                      <span className="badge badge--sub">{subscriptionPlan}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Settings */}
              <SettingsCard title="Account">
                {!user.emailVerified ? (
                  <SettingsRow
                    label="Email"
                    value={<>{user.email} {getVerificationStatus()}</>}
                    onClick={handleVerificationEmailClick}
                  />
                ) : (
                  <SettingsRow
                    label="Email"
                    value={<>{user.email} {getVerificationStatus()}</>}
                  />
                )}
                {SHOW_SUBSCRIPTION_MENTIONS && (
                  <SettingsRow
                    label="Subscription Plan"
                    value={getPlanBadge()}
                  />
                )}
                <SettingsRow
                  label="Preferences"
                  to={PAGES.PREFERENCES.PATH}
                />
              </SettingsCard>

              {/* Verification Message */}
              {message && (
                <InfoDisplay type={messageType || 'info'} message={message} />
              )}

              {/* Help */}
              <SettingsCard title="Help">
                <SettingsRow
                  label="Help Center"
                  to={PAGES.HELP_CENTER.PATH}
                />
                <SettingsRow
                  label="Revisit Onboarding"
                  to={PAGES.WELCOME.PATH}
                />
              </SettingsCard>

              {/* Danger Zone - Collapsible */}
              <SettingsCard title="Danger Zone" collapsible defaultCollapsed variant="danger">
                <SettingsRow
                  label="Delete Chat History"
                  to={PAGES.DELETE_HISTORY.PATH}
                  variant="danger"
                />
              </SettingsCard>

              {/* Sign Out Button */}
              <button
                className="sign-out-button"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? 'Signing out...' : 'Sign Out'}
              </button>
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
