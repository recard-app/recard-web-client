import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../context/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { PAGES, APP_NAME, COLORS } from '../../types';
import Icon from '../../icons';
import { ButtonSpinner } from '../../elements';
import { authenticateAndNavigate } from './utils';
import GoogleIcon from './GoogleIcon';
import './Auth.scss';

const SignIn: React.FC = () => {
    const { login, loginWithEmail, syncAccount } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

    const handleEmailSignIn = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await authenticateAndNavigate(
            () => loginWithEmail(email, password),
            syncAccount,
            navigate,
            setIsLoading
        );
    };

    const handleGoogleSignIn = async (): Promise<void> => {
        await authenticateAndNavigate(
            () => login(),
            syncAccount,
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
