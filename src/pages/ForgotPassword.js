import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const { sendPasswordResetEmail } = useAuth();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await sendPasswordResetEmail(email);
            setError('');
            setMessage('Password reset email sent! Please check your inbox.');
        } catch (error) {
            setError(error.message || 'Failed to send reset email');
        }
    };

    return (
        <div className="auth-page">
            <h1>Reset Password</h1>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
            
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Send Reset Link</button>
            </form>

            <p className="auth-redirect">
                Remember your password? <Link to="/signin">Sign In</Link>
            </p>

            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}
        </div>
    );
};

export default ForgotPassword; 