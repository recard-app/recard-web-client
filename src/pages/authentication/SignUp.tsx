import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../context/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { auth as firebaseAuth } from '../../config/firebase';
import { PAGES, APP_NAME, COLORS } from '../../types';
import Icon from '../../icons';
import { InfoDisplay, ButtonSpinner } from '../../elements';
import { getAuthErrorMessage, authenticateAndNavigate } from './utils';
import { logError } from '../../utils/logger';
import GoogleIcon from './GoogleIcon';
import './Auth.scss';

/**
 * SignUp component for user registration.
 */
const SignUp: React.FC = () => {
    const { registerWithEmail, login, sendVerificationEmail, syncAccount, logout } = useAuth();
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

    /**
     * Handles the sign-up process for a new user.
     * @param {FormEvent<HTMLFormElement>} e - The form event.
     * @returns {Promise<void>}
     */
    const handleSignUp = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');

        // Validate passwords
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const { user } = await registerWithEmail(email, password);

            if (!user) {
                throw new Error('Registration failed - no user returned');
            }

            // Sync with backend (creates Firestore doc with promo plan)
            // This MUST happen before verification email -- if verification fails,
            // the user still gets their promo plan in Firestore
            try {
                await syncAccount({ firstName, lastName });
                // Reload user to pick up the server-set display name
                // (needed for WelcomeStep greeting and profile UI)
                await firebaseAuth.currentUser?.reload();
            } catch (syncError: any) {
                // Backend sync failed after Firebase Auth creation.
                // Only delete the auth user if we got an explicit server error response
                // (4xx/5xx). For network/timeout errors (no response), the server may
                // have committed -- deleting the auth user would orphan the Firestore doc.
                // Regardless of branch, force sign-out to avoid a half-initialized session.
                logError('Backend sync failed after registration:', syncError);
                const hasServerResponse = Boolean(syncError?.response?.status);
                if (hasServerResponse) {
                    try {
                        await firebaseAuth.currentUser?.delete();
                    } catch (deleteError) {
                        logError('Failed to clean up orphaned auth user:', deleteError);
                    }
                }

                // Always force sign-out when sync does not confirm success.
                // This prevents a partially initialized authenticated session.
                try {
                    await logout();
                } catch (logoutError) {
                    logError('Forced sign out after signup sync failure failed:', logoutError);
                }

                if (hasServerResponse) {
                    toast.error('Account setup failed. Please try creating your account again.');
                } else {
                    toast.error('Connection issue during setup. Please try again.');
                }
                return;
            }

            // Send verification email (non-blocking for signup completion)
            try {
                await sendVerificationEmail();
            } catch (verificationError) {
                // Log but don't block signup -- user can resend from settings
                logError('Verification email failed (non-blocking):', verificationError);
                toast.error('Account created, but we could not send a verification email. You can resend it from onboarding.');
            }

            navigate(PAGES.ONBOARDING.PATH);
        } catch (error: any) {
            toast.error(getAuthErrorMessage(error));
            logError('Registration failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async (): Promise<void> => {
        await authenticateAndNavigate(
            () => login(),
            syncAccount,
            logout,
            navigate,
            setIsGoogleLoading
        );
    };

    const isFormDisabled = isLoading || isGoogleLoading;

    return (
        <div className="auth-page">
            <div className="auth-brand">
                <Icon name="cardzen-logo" variant="solid" size={36} color={COLORS.PRIMARY_COLOR} className="brand-logo" />
                <span className="brand-name">{APP_NAME}</span>
            </div>
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Create your account</h1>
                    <p className="subtitle">Start optimizing your credit card rewards.</p>
                </div>

                <form onSubmit={handleSignUp} className="auth-form">
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="First name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            maxLength={50}
                            disabled={isFormDisabled}
                            className="default-input"
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            maxLength={50}
                            disabled={isFormDisabled}
                            className="default-input"
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isFormDisabled}
                            className="default-input"
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isFormDisabled}
                            className="default-input"
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="password"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isFormDisabled}
                            className="default-input"
                        />
                    </div>
                    <button type="submit" className="submit-button" disabled={isFormDisabled}>
                        {isLoading ? <ButtonSpinner /> : 'Create account'}
                    </button>
                </form>

                <p className="auth-legal-text">
                    By creating an account, you agree to our{' '}
                    <Link to={PAGES.TERMS_OF_SERVICE.PATH} target="_blank" rel="noopener noreferrer">Terms of Service</Link>{' '}
                    and{' '}
                    <Link to={PAGES.PRIVACY_POLICY.PATH} target="_blank" rel="noopener noreferrer">Privacy Policy</Link>.
                </p>

                <div className="auth-divider">or continue with</div>
                <button
                    onClick={handleGoogleSignIn}
                    className="social-button"
                    disabled={isFormDisabled}
                >
                    {isGoogleLoading ? (
                        <ButtonSpinner />
                    ) : (
                        <>
                            <GoogleIcon />
                            Sign up with Google
                        </>
                    )}
                </button>

                <p className="auth-redirect">
                    Already have an account? <Link to={PAGES.SIGN_IN.PATH}>Sign in</Link>
                </p>

                {error && (
                    <InfoDisplay
                        type="error"
                        message={error}
                    />
                )}
            </div>
        </div>
    );
};

export default SignUp;
