import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const SignUp = () => {
    const { registerWithEmail } = useAuth();
    const navigate = useNavigate();
    const apiurl = process.env.REACT_APP_BASE_URL;
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const validateNames = () => {
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

    const handleSignUp = async (e) => {
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
            const { user, token } = await registerWithEmail(email, password, firstName, lastName);
            
            const response = await fetch(`${apiurl}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    firstName,
                    lastName
                })
            });
            
            if (response.ok) {
                console.log('Registration successful');
                navigate('/welcome');
            } else {
                // Handle server validation errors
                const data = await response.json();
                setError(data.error || 'Registration failed');
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
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                />
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