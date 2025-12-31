import React, { useState, useEffect, FormEvent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
    verifyPasswordResetCode,
    confirmPasswordReset,
    applyActionCode,
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { PAGES, APP_NAME, APP_LOGO } from '../../types';
import { ButtonSpinner, InfoDisplay } from '../../elements';
import './Auth.scss';
import './AuthAction.scss';

// Valid action modes - array for runtime validation
const VALID_MODES = ['resetPassword', 'verifyEmail', 'recoverEmail'] as const;
type ActionMode = typeof VALID_MODES[number];

// UI view states
type ViewState =
    | 'loading'
    | 'resetPassword'
    | 'verifyingEmail'
    | 'success'
    | 'error';

/**
 * Maps Firebase Auth error codes to user-friendly messages
 */
const getActionErrorMessage = (error: any): string => {
    const code = error?.code || '';

    switch (code) {
        case 'auth/expired-action-code':
            return 'This link has expired. Please request a new one.';
        case 'auth/invalid-action-code':
            return 'This link is invalid or has already been used.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/user-not-found':
            return 'No account found for this action.';
        case 'auth/weak-password':
            return 'Password is too weak. Please use at least 6 characters.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection and try again.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        default:
            return 'An error occurred. Please try again or request a new link.';
    }
};

/**
 * Returns success message based on action mode
 */
const getSuccessMessage = (mode: ActionMode): string => {
    switch (mode) {
        case 'resetPassword':
            return 'Your password has been reset successfully.';
        case 'verifyEmail':
            return 'Your email has been verified successfully.';
        case 'recoverEmail':
            return 'Your email has been recovered successfully.';
    }
};

/**
 * AuthAction component handles Firebase email action links
 * for password reset, email verification, and email recovery.
 */
const AuthAction: React.FC = () => {
    const [searchParams] = useSearchParams();

    // State
    const [viewState, setViewState] = useState<ViewState>('loading');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [actionMode, setActionMode] = useState<ActionMode | null>(null);
    const [oobCode, setOobCode] = useState('');

    // Process action on mount
    useEffect(() => {
        let isMounted = true;

        const processAction = async () => {
            const rawMode = searchParams.get('mode');
            const code = searchParams.get('oobCode');

            // SECURITY: Runtime validation of mode parameter
            const mode = VALID_MODES.includes(rawMode as ActionMode)
                ? (rawMode as ActionMode)
                : null;

            // Validate required params
            if (!mode || !code) {
                if (isMounted) {
                    setErrorMessage('Invalid link. Please use the link from your email.');
                    setViewState('error');
                }
                return;
            }

            if (isMounted) {
                setActionMode(mode);
                setOobCode(code);
            }

            // Handle based on validated mode
            switch (mode) {
                case 'resetPassword':
                    try {
                        await verifyPasswordResetCode(auth, code);
                        if (isMounted) {
                            setViewState('resetPassword');
                        }
                    } catch (error) {
                        if (isMounted) {
                            setErrorMessage(getActionErrorMessage(error));
                            setViewState('error');
                        }
                    }
                    break;

                case 'verifyEmail':
                    if (isMounted) {
                        setViewState('verifyingEmail');
                    }
                    try {
                        await applyActionCode(auth, code);
                        if (isMounted) {
                            setSuccessMessage(getSuccessMessage('verifyEmail'));
                            setViewState('success');
                        }
                    } catch (error) {
                        if (isMounted) {
                            setErrorMessage(getActionErrorMessage(error));
                            setViewState('error');
                        }
                    }
                    break;

                case 'recoverEmail':
                    if (isMounted) {
                        setViewState('verifyingEmail');
                    }
                    try {
                        await applyActionCode(auth, code);
                        if (isMounted) {
                            setSuccessMessage(getSuccessMessage('recoverEmail'));
                            setViewState('success');
                        }
                    } catch (error) {
                        if (isMounted) {
                            setErrorMessage(getActionErrorMessage(error));
                            setViewState('error');
                        }
                    }
                    break;
            }
        };

        processAction();

        return () => {
            isMounted = false;
        };
    }, [searchParams]);

    /**
     * Handle password reset form submission
     */
    const handlePasswordReset = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        // Validate passwords match
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            // SECURITY: Clear password fields on validation error
            setPassword('');
            setConfirmPassword('');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            await confirmPasswordReset(auth, oobCode, password);
            // SECURITY: Clear password fields on success
            setPassword('');
            setConfirmPassword('');
            setSuccessMessage(getSuccessMessage('resetPassword'));
            setViewState('success');
        } catch (error) {
            // SECURITY: Clear password fields on error
            setPassword('');
            setConfirmPassword('');
            setErrorMessage(getActionErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Get page title based on current state
     */
    const getTitle = (): string => {
        if (viewState === 'error') return 'Something went wrong';
        if (viewState === 'success') return 'Success';
        switch (actionMode) {
            case 'resetPassword':
                return 'Reset your password';
            case 'verifyEmail':
                return 'Verifying your email';
            case 'recoverEmail':
                return 'Recovering your email';
            default:
                return 'Account Action';
        }
    };

    /**
     * Get subtitle based on current state
     */
    const getSubtitle = (): string | null => {
        if (viewState === 'resetPassword') {
            return 'Enter your new password below.';
        }
        return null;
    };

    return (
        <div className="auth-page">
            <div className="auth-brand">
                <img src={APP_LOGO} alt={`${APP_NAME} logo`} className="brand-logo" />
                <span className="brand-name">{APP_NAME}</span>
            </div>
            <div className="auth-card">
                <div className="auth-header">
                    <h1>{getTitle()}</h1>
                    {getSubtitle() && <p className="subtitle">{getSubtitle()}</p>}
                </div>

                {/* Loading State */}
                {viewState === 'loading' && (
                    <div className="auth-action-loading">
                        <ButtonSpinner />
                        <p>Please wait...</p>
                    </div>
                )}

                {/* Verifying Email State */}
                {viewState === 'verifyingEmail' && (
                    <div className="auth-action-loading">
                        <ButtonSpinner />
                        <p>Verifying your email...</p>
                    </div>
                )}

                {/* Password Reset Form */}
                {viewState === 'resetPassword' && (
                    <form onSubmit={handlePasswordReset} className="auth-form">
                        <div className="form-row">
                            <input
                                type="password"
                                placeholder="New password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                                className="default-input"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="form-row">
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                autoComplete="new-password"
                                className="default-input"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        {errorMessage && (
                            <InfoDisplay
                                type="error"
                                message={errorMessage}
                            />
                        )}
                        <button type="submit" className="submit-button" disabled={isSubmitting}>
                            {isSubmitting ? <ButtonSpinner /> : 'Reset password'}
                        </button>
                    </form>
                )}

                {/* Success State */}
                {viewState === 'success' && (
                    <>
                        <InfoDisplay
                            type="success"
                            message={successMessage}
                        />
                        <p className="auth-redirect">
                            <Link to={PAGES.SIGN_IN.PATH}>Continue to sign in</Link>
                        </p>
                    </>
                )}

                {/* Error State */}
                {viewState === 'error' && (
                    <>
                        <InfoDisplay
                            type="error"
                            message={errorMessage}
                        />
                        <p className="auth-redirect">
                            <Link to={PAGES.SIGN_IN.PATH}>Return to sign in</Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthAction;
