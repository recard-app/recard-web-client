import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const apiurl = import.meta.env.VITE_BASE_URL;

const SignIn = () => {
    const { login, loginWithEmail, sendPasswordResetEmail } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleEmailSignIn = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const { user, token } = await loginWithEmail(email, password);
            
            const response = await fetch(`${apiurl}/auth/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                console.log('Authentication successful');
                navigate('/');
            }
        } catch (error) {
            setError(error.message);
            console.error('Authentication failed:', error);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const { user, token, isNewUser } = await login();
            
            const response = await fetch(`${apiurl}/auth/${isNewUser ? 'signup' : 'signin'}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                console.log('Authentication successful');
                if (isNewUser) {
                    navigate('/welcome');
                } else {
                    navigate('/');
                }
            }
        } catch (error) {
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
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
