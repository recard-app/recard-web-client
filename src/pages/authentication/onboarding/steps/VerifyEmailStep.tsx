import React, { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { Icon } from '../../../../icons';

const VerifyEmailStep: React.FC = () => {
  const { user, sendVerificationEmail } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [hasSent, setHasSent] = useState(false);

  const handleResend = async () => {
    setIsSending(true);
    try {
      await sendVerificationEmail();
      setHasSent(true);
    } finally {
      setIsSending(false);
    }
  };

  const isVerified = user?.emailVerified;

  return (
    <div className="onboarding-step">
      <div>
        <h2 className="onboarding-step__title">Verify Your Email</h2>
        <p className="onboarding-step__subtitle">
          Verify your email to secure your account and unlock additional features like higher chat limits.
        </p>
      </div>

      <div className="onboarding-verify">
        <p className="onboarding-step__description">
          Your email: <span className="onboarding-verify__email">{user?.email}</span>
        </p>

        {isVerified ? (
          <div className="onboarding-verify__verified">
            <Icon name="check-circle" variant="mini" size={20} />
            <span>Email verified</span>
          </div>
        ) : (
          <div>
            <button
              className="button outline"
              onClick={handleResend}
              disabled={isSending || hasSent}
            >
              {isSending ? 'Sending...' : hasSent ? 'Verification Email Sent' : 'Resend Verification Email'}
            </button>
            {hasSent && (
              <p className="onboarding-verify__resend-status">
                Check your inbox for the verification link.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailStep;
