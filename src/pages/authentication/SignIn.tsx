import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../../services';
import { AuthResponse } from '../../types';

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
            navigate('/');
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
                navigate('/welcome');
            } else {
                navigate('/');
            }
        } catch (error: any) {
            setError(error.message);
            console.error('Authentication failed:', error);
        }
    };

    return (
        <div className="auth-page">
            <h1>Sign In</h1>
            
            <form onSubmit={handleEmailSignIn}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Sign In with Email</button>
                <Link to="/forgotpassword" className="forgot-password-btn">
                    Forgot Password?
                </Link>
            </form>

            <div className="divider">or</div>

            <button className="google-btn" onClick={handleGoogleSignIn}>
                Continue with Google
            </button>

            <p className="auth-redirect">
                Need an account? <Link to="/signup">Sign Up</Link>
            </p>

            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default SignIn;
