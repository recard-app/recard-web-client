import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const SignUp = () => {
    const { registerWithEmail } = useAuth();
    const navigate = useNavigate();
    const apiurl = process.env.REACT_APP_BASE_URL;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        try {
            const { user, token } = await registerWithEmail(email, password);
            
            const response = await fetch(`${apiurl}/auth/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                console.log('Registration successful');
                navigate('/');
            }
        } catch (error) {
            setError(error.message);
            console.error('Registration failed:', error);
        }
    };

    return (
        <div className="auth-page">
            <h1>Create Account</h1>
            
            <form onSubmit={handleSignUp}>
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
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <button type="submit">Create Account</button>
            </form>

            <p className="auth-redirect">
                Already have an account? <Link to="/signin">Sign In</Link>
            </p>

            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default SignUp; 