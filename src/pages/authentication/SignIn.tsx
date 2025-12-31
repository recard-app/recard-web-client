import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthService } from '../../services';
import { AuthResponse, PAGES, APP_NAME, APP_LOGO } from '../../types';
import { ButtonSpinner } from '../../elements';
import { getAuthErrorMessage } from './utils';
import { logError } from '../../utils/logger';
import './Auth.scss';

// Google icon SVG component
const GoogleIcon: React.FC = () => (
    <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
);

const SignIn: React.FC = () => {
    const { login, loginWithEmail } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

    /**
     * Handles the email sign-in process.
     * @param e - The form event triggered on submission.
     */
    const handleEmailSignIn = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await loginWithEmail(email, password);
            await AuthService.emailSignIn();
            console.log('Authentication successful');
            navigate(PAGES.HOME.PATH);
        } catch (error: any) {
            toast.error(getAuthErrorMessage(error));
            logError('Authentication failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handles the Google sign-in process.
     * @returns A promise that resolves when the sign-in is complete.
     */
    const handleGoogleSignIn = async (): Promise<void> => {
        setIsGoogleLoading(true);

        try {
            const { isNewUser }: AuthResponse = await login();
            await AuthService.googleSignIn(isNewUser);
            console.log('Authentication successful');
            if (isNewUser) {
                navigate(PAGES.WELCOME.PATH);
            } else {
                navigate(PAGES.HOME.PATH);
            }
        } catch (error: any) {
            toast.error(getAuthErrorMessage(error));
            logError('Authentication failed:', error);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const isFormDisabled = isLoading || isGoogleLoading;

    return (
        <div className="auth-page">
            <div className="auth-brand">
                <img src={APP_LOGO} alt={`${APP_NAME} logo`} className="brand-logo" />
                <span className="brand-name">{APP_NAME}</span>
            </div>
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Sign in</h1>
                    <p className="subtitle">Welcome back. Please enter your details.</p>
                </div>

                <form onSubmit={handleEmailSignIn} className="auth-form">
                    <div className="form-row">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            required
                            disabled={isFormDisabled}
                            className="default-input"
                        />
                    </div>
                    <div className="form-actions">
                        <Link to={PAGES.FORGOT_PASSWORD.PATH} className="aux-link">Forgot password?</Link>
                    </div>
                    <button type="submit" className="submit-button" disabled={isFormDisabled}>
                        {isLoading ? <ButtonSpinner /> : 'Sign in'}
                    </button>
                </form>

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
                            Continue with Google
                        </>
                    )}
                </button>

                <p className="auth-redirect">
                    Need an account? <Link to={PAGES.SIGN_UP.PATH}>Create one</Link>
                </p>
            </div>
        </div>
    );
};

export default SignIn;
