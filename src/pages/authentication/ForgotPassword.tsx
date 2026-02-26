import React, { useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { PAGES, APP_NAME, COLORS } from '../../types';
import Icon from '../../icons';
import { ButtonSpinner } from '../../elements';
import './Auth.scss';

const ForgotPassword: React.FC = () => {
    const { sendPasswordResetEmail } = useAuth();
    const [email, setEmail] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await sendPasswordResetEmail(email);
        } catch (error: any) {
            // Only suppress auth/user-not-found to prevent enumeration
            // All other errors should be shown to the user
            if (error?.code === 'auth/user-not-found') {
                // Log in dev only for debugging
                if (import.meta.env.DEV) {
                    console.log('Password reset: email not found (hidden from user)');
                }
                // Fall through to show success message
            } else {
                // Show actual errors (rate limiting, invalid email, network, etc.)
                const errorMessages: Record<string, string> = {
                    'auth/too-many-requests': 'Too many attempts. Please try again later.',
                    'auth/invalid-email': 'Please enter a valid email address.',
                    'auth/user-disabled': 'This account has been disabled.',
                };
                const message = errorMessages[error?.code] || 'An error occurred. Please try again.';
                toast.error(message);
                setIsLoading(false);
                return;
            }
        }
        // Show success message (for valid emails and suppressed user-not-found)
        toast.success('If an account exists with this email, you will receive a password reset link.');
        setIsLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-brand">
                <Icon name="cardzen-logo" variant="solid" size={36} color={COLORS.PRIMARY_COLOR} className="brand-logo" />
                <span className="brand-name">{APP_NAME}</span>
            </div>
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Reset your password</h1>
                    <p className="subtitle">Enter your email and we'll send you a reset link.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            className="default-input"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <button type="submit" className="submit-button" disabled={isLoading}>
                        {isLoading ? <ButtonSpinner /> : 'Send reset link'}
                    </button>
                </form>

                <p className="auth-redirect">
                    Remember your password? <Link to={PAGES.SIGN_IN.PATH}>Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
