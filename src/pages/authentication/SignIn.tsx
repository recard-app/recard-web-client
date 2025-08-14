import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../../services';
import { AuthResponse, PAGES, APP_NAME, APP_LOGO } from '../../types';
import { InfoDisplay } from '../../elements';
import './Auth.scss';

const SignIn: React.FC = () => {
    const { login, loginWithEmail } = useAuth(); // Destructure login methods from AuthContext
    const navigate = useNavigate(); // Hook for programmatic navigation
    const [email, setEmail] = useState<string>(''); // State for email input
    const [password, setPassword] = useState<string>(''); // State for password input
    const [error, setError] = useState<string>(''); // State for error messages

    /**
     * Handles the email sign-in process.
     * @param e - The form event triggered on submission.
     */
    const handleEmailSignIn = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent default form submission behavior
        setError(''); // Reset any previous error messages
        
        try {
            await loginWithEmail(email, password); // Attempt to log in with email and password
            await AuthService.emailSignIn();
            console.log('Authentication successful');
            navigate(PAGES.HOME.PATH);
        } catch (error: any) {
            setError(error.message);
            console.error('Authentication failed:', error);
        }
    };

    /**
     * Handles the Google sign-in process.
     * @returns A promise that resolves when the sign-in is complete.
     */
    const handleGoogleSignIn = async (): Promise<void> => {
        try {
            const { isNewUser }: AuthResponse = await login(); // Attempt to log in with Google
            await AuthService.googleSignIn(isNewUser); // Call the Google sign-in service
            console.log('Authentication successful');
            if (isNewUser) {
                navigate(PAGES.WELCOME.PATH);
            } else {
                navigate(PAGES.HOME.PATH);
            }
        } catch (error: any) {
            setError(error.message);
            console.error('Authentication failed:', error);
        }
    };

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
                            className="default-input"
                        />
                    </div>
                    <div className="form-actions">
                        <Link to={PAGES.FORGOT_PASSWORD.PATH} className="aux-link">Forgot password?</Link>
                    </div>
                    <button type="submit" className="submit-button">Sign in</button>
                </form>

                <div className="auth-divider">or continue with</div>
                <button onClick={handleGoogleSignIn} className="social-button">
                    Continue with Google
                </button>

                <p className="auth-redirect">
                    Need an account? <Link to={PAGES.SIGN_UP.PATH}>Create one</Link>
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

export default SignIn;
