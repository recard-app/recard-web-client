import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../../../context/useAuth';
import { RefreshButton } from '../../../../components/RefreshButton';
import { InfoDisplay } from '../../../../elements';
import { Icon } from '../../../../icons';
import OnboardingHeader from '../OnboardingHeader';

const VerifyEmailStep: React.FC = () => {
  const { user, sendVerificationEmail, refreshUser } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [hasSent, setHasSent] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleResend = async () => {
    setIsSending(true);
    try {
      await sendVerificationEmail();
      setHasSent(true);
      toast.success('Verification email sent. Check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification email. Please try again later.');
    } finally {
      setIsSending(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
    } finally {
      setIsRefreshing(false);
    }
  };

  const isVerified = user?.emailVerified;

  return (
    <div className="onboarding-step">
      <OnboardingHeader
        icon="shield-check"
        title="Verify Your Email"
        description="Verify your email to secure your account and unlock additional features like higher chat limits."
      />

      <div className="onboarding-verify">
        <div className="onboarding-verify__email-block">
          <p className="onboarding-step__description">Your email: <span className="onboarding-verify__email">{user?.email}</span></p>
          <div className="onboarding-verify__status-line">
            <span className="showcase-badges">
              <span className={`badge ${isVerified ? 'badge-verified' : 'badge-unverified'}`}>
                {isVerified
                  ? <Icon name="check-circle" variant="mini" size={12} />
                  : <Icon name="exclamation-triangle" variant="mini" size={12} />}
                {isVerified ? 'Verified' : 'Not Verified'}
              </span>
            </span>
            {!isVerified && (
              <RefreshButton
                onClick={handleRefresh}
                isLoading={isRefreshing}
                title="Check verification status"
              />
            )}
          </div>
        </div>

        {isVerified ? (
          <InfoDisplay type="success" message="Your email is verified. You're all set!" showTitle={false} />
        ) : (
          <>
            <div className="onboarding-verify__actions">
              <button
                className="button outline"
                onClick={handleResend}
                disabled={isSending || hasSent}
                style={{ alignSelf: 'flex-start' }}
              >
                {isSending ? 'Sending...' : hasSent ? 'Verification Email Sent' : 'Resend Verification Email'}
              </button>
            </div>
            {hasSent && (
              <InfoDisplay type="info" message="Check your inbox for the verification link." />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailStep;
