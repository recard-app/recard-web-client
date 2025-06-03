import React from 'react';
import PreferencesModule from '../../components/PreferencesModule';
import { ChatHistoryPreference, InstructionsPreference, ShowCompletedOnlyPreference } from '../../types/UserTypes';
import PageHeader from '../../components/PageHeader';

interface PreferencesProps {
    onModalOpen: () => void;
    preferencesInstructions: InstructionsPreference;
    setPreferencesInstructions: (instructions: InstructionsPreference) => void;
    chatHistoryPreference: ChatHistoryPreference;
    setChatHistoryPreference: (preference: ChatHistoryPreference) => void;
    showCompletedOnlyPreference: ShowCompletedOnlyPreference;
    setShowCompletedOnlyPreference: (preference: ShowCompletedOnlyPreference) => void;
}

const Preferences: React.FC<PreferencesProps> = ({ 
    onModalOpen, 
    preferencesInstructions, 
    setPreferencesInstructions,
    chatHistoryPreference,
    setChatHistoryPreference,
    showCompletedOnlyPreference,
    setShowCompletedOnlyPreference
}) => {
    return (
        <div className="preferences-page">
            <div className="preferences-page-container">
                <PageHeader title="Preferences" />
                <button onClick={onModalOpen} className="credit-card-button">
                    Manage Credit Cards
                </button>
                <PreferencesModule 
                    customInstructions={preferencesInstructions}
                    onInstructionsUpdate={setPreferencesInstructions}
                    chatHistoryPreference={chatHistoryPreference}
                    setChatHistoryPreference={setChatHistoryPreference}
                    showCompletedOnlyPreference={showCompletedOnlyPreference}
                    setShowCompletedOnlyPreference={setShowCompletedOnlyPreference}
                />
            </div>
        </div>
    );
};

export default Preferences;