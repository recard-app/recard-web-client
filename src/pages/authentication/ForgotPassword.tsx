import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { InfoDisplay } from '../../elements';

const ForgotPassword: React.FC = () => {
    const { sendPasswordResetEmail } = useAuth();
    const [email, setEmail] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await sendPasswordResetEmail(email);
            setError('');
            setMessage('Password reset email sent! Please check your inbox.');
        } catch (error: any) {
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Send Reset Link</button>
            </form>

            <p className="auth-redirect">
                Remember your password? <Link to="/signin">Sign In</Link>
            </p>

            {error && (
                <InfoDisplay
                    type="error"
                    message={error}
                />
            )}
            {message && (
                <InfoDisplay
                    type="success"
                    message={message}
                />
            )}
        </div>
    );
};

export default ForgotPassword; 