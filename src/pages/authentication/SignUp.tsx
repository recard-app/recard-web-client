import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../../services';
import { AuthResponse, PAGES, APP_NAME, APP_LOGO } from '../../types';
import { InfoDisplay } from '../../elements';
import './Auth.scss';

/**
 * Interface representing the structure of an error response.
 */
interface SignUpError {
    message: string;
}

/**
 * SignUp component for user registration.
 */
const SignUp: React.FC = () => {
    const { registerWithEmail, login, sendVerificationEmail } = useAuth();
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<string>('');

    /**
     * Validates the first and last names entered by the user.
     * @returns {boolean} - Returns true if names are valid, otherwise false.
     */
    const validateNames = (): boolean => {
        // Check if names are empty after trimming
        if (firstName.trim().length === 0 || lastName.trim().length === 0) {
            setError('First name and last name cannot be empty');
            return false;
        }

        // Validate name format
        const nameRegex = /^[a-zA-Z\s-']+$/;
        if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
            setError('Names can only contain letters, spaces, hyphens, and apostrophes');
            return false;
        }

        return true;
    };

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

        // Validate names
        if (!validateNames()) {
            return;
        }
        
        try {
            const { user } = await registerWithEmail(email, password, firstName, lastName) as AuthResponse;

            if (!user) {
                throw new Error('Registration failed - no user returned');
            }
            
            // Send verification email
            await sendVerificationEmail();
            
            // Use the UserAuthService for backend registration
            await AuthService.emailSignUp(firstName, lastName);
            
            console.log('Registration successful');
            navigate(PAGES.WELCOME.PATH);
        } catch (error) {
            const err = error as SignUpError;
            setError(err.message);
            console.error('Registration failed:', err);
        }
    };

    /**
     * Handles Google sign-in for the user.
     * @returns {Promise<void>}
     */
    const handleGoogleSignIn = async (): Promise<void> => {
        try {
            const { isNewUser } = await login() as AuthResponse;
            
            // Use the UserAuthService for Google authentication
            await AuthService.googleSignIn(isNewUser ?? false);
            
            console.log('Authentication successful');
            if (isNewUser) {
                navigate(PAGES.WELCOME.PATH);
            } else {
                navigate(PAGES.HOME.PATH);
            }
        } catch (error) {
            const err = error as SignUpError;
            setError(err.message);
            console.error('Authentication failed:', err);
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
                            className="default-input"
                        />
                    </div>
                    <button type="submit" className="submit-button">Create account</button>
                </form>

                <div className="auth-divider">or continue with</div>
                <button onClick={handleGoogleSignIn} className="social-button">
                    Sign up with Google
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