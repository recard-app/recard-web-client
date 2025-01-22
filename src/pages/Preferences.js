import React from 'react';

const Preferences = ({ onModalOpen }) => {
    return (
        <div className="preferences-page">
            <div className="preferences-page-container">
                <h1>Preferences</h1>
                <button onClick={onModalOpen} className="credit-card-button">
                    Manage Credit Cards
                </button>
            </div>
        </div>
    );
};

export default Preferences;