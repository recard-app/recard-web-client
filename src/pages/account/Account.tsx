import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { SubscriptionPlan, PAGE_NAMES, PAGE_ICONS, LOADING_ICON, LOADING_ICON_SIZE, ICON_GRAY } from '../../types';
import Icon from '../../icons';
import { SHOW_SUBSCRIPTION_MENTIONS } from '../../types';
import {
  handleVerificationEmail as handleVerificationEmailUtil,
  validateDisplayName,
  validateEmail,
  getEmailChangeErrorMessage,
  hasPasswordProvider,
} from './utils';
import PageHeader from '../../components/PageHeader';
import { useFullHeight } from '../../hooks/useFullHeight';
import { InfoDisplay } from '../../elements';
import { SettingsCard, SettingsRow } from '../../components/SettingsCard';
import ContentContainer from '../../components/ContentContainer';
import { PAGES } from '../../types/Pages';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '../../components/ui/dialog/dialog';
import './Account.scss';

interface AccountProps {
  subscriptionPlan: SubscriptionPlan;
}

const Account: React.FC<AccountProps> = ({ subscriptionPlan }) => {
  const { user, sendVerificationEmail, sendPasswordResetEmail, updateDisplayName, updateEmail, logout } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Name change modal state
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(user?.displayName || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Password reset state
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Email change modal state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useFullHeight(true);

  const handleVerificationEmailClick = async (): Promise<void> => {
    const result = await handleVerificationEmailUtil(sendVerificationEmail);
    if (result.messageType === 'success') {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
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

  const handleNameSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const validation = validateDisplayName(newDisplayName);
    if (!validation.valid) {
      setNameError(validation.error || 'Invalid name');
      return;
    }

    setIsUpdatingName(true);
    setNameError(null);
    try {
      await updateDisplayName(newDisplayName.trim());
      setIsNameModalOpen(false);
      toast.success('Name updated successfully');
    } catch (error) {
      setNameError('Failed to update name. Please try again.');
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleOpenNameModal = (): void => {
    setNewDisplayName(user?.displayName || '');
    setNameError(null);
    setIsNameModalOpen(true);
  };

  const handleResetPassword = async (): Promise<void> => {
    if (!user?.email || isResettingPassword) return;

    setIsResettingPassword(true);
    try {
      await sendPasswordResetEmail(user.email);
      toast.success('Password reset email sent. Check your inbox.');
    } catch (error) {
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleOpenEmailModal = (): void => {
    setNewEmail('');
    setCurrentPassword('');
    setEmailError(null);
    setIsEmailModalOpen(true);
  };

  const handleEmailSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // Validate new email format
    const validation = validateEmail(newEmail);
    if (!validation.valid) {
      setEmailError(validation.error || 'Invalid email');
      return;
    }

    // Check if new email is same as current
    if (newEmail.trim().toLowerCase() === user?.email?.toLowerCase()) {
      setEmailError('New email must be different from current email');
      return;
    }

    setIsUpdatingEmail(true);
    setEmailError(null);

    try {
      await updateEmail(newEmail.trim(), currentPassword);
      setIsEmailModalOpen(false);
      toast.success(`Verification email sent to ${newEmail}. Click the link to complete the change.`);
    } catch (error: any) {
      setEmailError(getEmailChangeErrorMessage(error));
      // Clear password on error for security (especially for wrong password)
      setCurrentPassword('');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const getVerificationStatus = () => {
    if (user?.emailVerified) {
      return <span className="status-badge status-badge--success">Verified</span>;
    }
    return <span className="status-badge status-badge--warning">Not Verified</span>;
  };

  const getPlanText = () => {
    return subscriptionPlan.charAt(0).toUpperCase() + subscriptionPlan.slice(1);
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
                <SettingsRow
                  label="Name"
                  value={user.displayName || 'Not set'}
                  onClick={handleOpenNameModal}
                />
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
                {hasPasswordProvider(user.providerData) ? (
                  <SettingsRow
                    label="Change Email"
                    onClick={handleOpenEmailModal}
                  />
                ) : (
                  <SettingsRow
                    label="Change Email"
                    value={<span className="disabled-hint">Not available for Google sign-in</span>}
                    disabled
                  />
                )}
                {hasPasswordProvider(user.providerData) ? (
                  <SettingsRow
                    label="Reset Password"
                    onClick={handleResetPassword}
                    loading={isResettingPassword}
                  />
                ) : (
                  <SettingsRow
                    label="Reset Password"
                    value={<span className="disabled-hint">Not available for Google sign-in</span>}
                    disabled
                  />
                )}
                {SHOW_SUBSCRIPTION_MENTIONS && (
                  <SettingsRow
                    label="Subscription Plan"
                    value={getPlanText()}
                  />
                )}
                <SettingsRow
                  label="Preferences"
                  to={PAGES.PREFERENCES.PATH}
                />
                <SettingsRow
                  label={isSigningOut ? 'Signing out...' : 'Sign Out'}
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  icon={<Icon name="sign-out" variant="mini" size={16} color={ICON_GRAY} />}
                />
              </SettingsCard>

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
                <SettingsRow
                  label="Delete Account"
                  to={PAGES.DELETE_ACCOUNT.PATH}
                  variant="danger"
                />
              </SettingsCard>

              {/* Change Name Modal */}
              <Dialog open={isNameModalOpen} onOpenChange={setIsNameModalOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Name</DialogTitle>
                  </DialogHeader>
                  <DialogBody>
                    <form onSubmit={handleNameSubmit} className="name-change-form">
                      <input
                        type="text"
                        value={newDisplayName}
                        onChange={(e) => setNewDisplayName(e.target.value)}
                        placeholder="Enter your name"
                        className="default-input"
                        maxLength={50}
                        required
                        autoFocus
                      />
                      <div className="character-count">
                        {newDisplayName.length}/50
                      </div>
                      {nameError && <InfoDisplay type="error" message={nameError} />}
                    </form>
                  </DialogBody>
                  <DialogFooter>
                    <div className="button-group">
                      <button
                        type="button"
                        className="button outline"
                        onClick={() => setIsNameModalOpen(false)}
                        disabled={isUpdatingName}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`button ${isUpdatingName ? 'loading icon with-text' : ''}`}
                        onClick={handleNameSubmit}
                        disabled={isUpdatingName}
                      >
                        {isUpdatingName && <LOADING_ICON size={LOADING_ICON_SIZE} />}
                        {isUpdatingName ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Change Email Modal */}
              <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Email</DialogTitle>
                  </DialogHeader>
                  <DialogBody>
                    <form onSubmit={handleEmailSubmit} className="email-change-form">
                      <div className="form-field">
                        <label className="form-label">Current Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="default-input disabled"
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">New Email</label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="Enter new email address"
                          className="default-input"
                          required
                          autoFocus
                          disabled={isUpdatingEmail}
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Current Password</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                          className="default-input"
                          required
                          disabled={isUpdatingEmail}
                        />
                      </div>
                      {emailError && <InfoDisplay type="error" message={emailError} />}
                    </form>
                  </DialogBody>
                  <DialogFooter>
                    <div className="button-group">
                      <button
                        type="button"
                        className="button outline"
                        onClick={() => setIsEmailModalOpen(false)}
                        disabled={isUpdatingEmail}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className={`button ${isUpdatingEmail ? 'loading icon with-text' : ''}`}
                        onClick={handleEmailSubmit}
                        disabled={isUpdatingEmail || !newEmail.trim() || !currentPassword}
                      >
                        {isUpdatingEmail && <LOADING_ICON size={LOADING_ICON_SIZE} />}
                        {isUpdatingEmail ? 'Sending...' : 'Send Verification'}
                      </button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
