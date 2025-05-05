import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface WelcomeProps {
    onModalOpen: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onModalOpen }) => {
    const { user } = useAuth();
    
    return (
        <div className="welcome-page">
            <h1>
                {user?.displayName ? `Hi ${user.displayName}! Welcome to ReCard! 👋` : 'Hi! Welcome to ReCard! 👋'}
            </h1>
            
            <div className="welcome-content">
                <h2>Let's get started:</h2>
                <div className="steps">
                    <div className="step active">
                        <h3>1. Add Your Credit Cards</h3>
                        <p>Select which credit cards you own to get personalized recommendations.</p>
                        <button onClick={onModalOpen} className="action-btn">
                            Select Your Credit Cards
                        </button>
                    </div>

                    <div className="step">
                        <h3>2. Verify Your Email</h3>
                        <p>Please verify your email address to ensure account security and unlock more features.</p>
                        <p>You can see the status and send a verification email from your <Link to="/account">account page.</Link></p>
                    </div>

                    <div className="step">
                        <h3>3. Ask Questions</h3>
                        <p>Ask about purchases and we'll help you maximize your rewards.</p>
                    </div>
                    
                    <div className="step">
                        <h3>4. Get Recommendations</h3>
                        <p>Receive instant suggestions on which card to use for the best rewards.</p>
                    </div>
                </div>

                <Link to="/" className="get-started-btn">
                    Get Started
                </Link>
            </div>
        </div>
    );
};

export default Welcome; 