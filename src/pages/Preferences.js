import React from 'react';
import PreferencesModule from '../components/PreferencesModule';

const Preferences = ({ onModalOpen, preferencesInstructions, setPreferencesInstructions }) => {
    return (
        <div className="preferences-page">
            <div className="preferences-page-container">
                <h1>Preferences</h1>
                <button onClick={onModalOpen} className="credit-card-button">
                    Manage Credit Cards
                </button>
                <PreferencesModule 
                    initialInstructions={preferencesInstructions}
                    onInstructionsUpdate={setPreferencesInstructions}
                />
            </div>
        </div>
    );
};

export default Preferences;