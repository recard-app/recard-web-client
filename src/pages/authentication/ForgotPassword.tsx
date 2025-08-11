import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { PAGES } from '../../types';
import { InfoDisplay } from '../../elements';
import './Auth.scss';

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
        <div className="auth-card">
                <div className="auth-header">
                    <h1>Reset your password</h1>
                    <p className="subtitle">Enter your email and we’ll send you a reset link.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            className="default-input"
                            required
                        />
                    </div>
                    <button type="submit" className="submit-button">Send reset link</button>
                </form>

                <p className="auth-redirect">
                    Remember your password? <Link to={PAGES.SIGN_IN.PATH}>Sign in</Link>
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