import React from 'react';
import { Link } from 'react-router-dom';

const Welcome = () => {
    return (
        <div className="welcome-page">
            <h1>Welcome to ReCard! 👋</h1>
            
            <div className="welcome-content">
                <h2>Let's get started:</h2>
                <div className="steps">
                    <div className="step">
                        <h3>1. Add Your Credit Cards</h3>
                        <p>Select which credit cards you own to get personalized recommendations.</p>
                    </div>
                    
                    <div className="step">
                        <h3>2. Ask Questions</h3>
                        <p>Ask about purchases and we'll help you maximize your rewards.</p>
                    </div>
                    
                    <div className="step">
                        <h3>3. Get Recommendations</h3>
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