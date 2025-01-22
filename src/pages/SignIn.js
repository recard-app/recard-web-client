import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const apiurl = process.env.REACT_APP_BASE_URL;

    const handleSignIn = async () => {
        try {
            const { user, token } = await login();
            
            // Send token to your backend
            const response = await fetch(`${apiurl}/auth/verify`, {
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
            console.error('Authentication failed:', error);
        }
    };

    return (
        <div>
            <h1>Sign In</h1>
            <button onClick={handleSignIn}>Sign in with Google</button>
        </div>
    );
};

export default SignIn;
