import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const apiurl = process.env.REACT_APP_BASE_URL;

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await fetch(`${apiurl}/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ credential: credentialResponse.credential }),
            });
            const data = await response.json();
            //console.log('Google Auth Response:', data);
            login(data.user, data.token);
            console.log('Authentication successful');
            navigate('/'); // Redirect after successful login
        } catch (error) {
            console.error('Authentication failed:', error);
        }
    };

    const handleGoogleError = (error) => {
        console.error('Google sign-in error:', error);
    };

    return (
        <div>
            <h1>Sign In</h1>
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
            />
        </div>
    );
};

export default SignIn;
