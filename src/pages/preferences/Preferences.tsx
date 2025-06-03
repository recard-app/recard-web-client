import React from 'react';
import PreferencesModule from '../../components/PreferencesModule';
import { ChatHistoryPreference, InstructionsPreference, ShowCompletedOnlyPreference } from '../../types/UserTypes';
import PageHeader from '../../components/PageHeader';
import { useScrollHeight } from '../../hooks/useScrollHeight';
import { PAGE_NAMES } from '../../types';

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
    // Use the scroll height hook for this page
    useScrollHeight(true);

    return (
        <div className="full-page-layout">
            <PageHeader title={PAGE_NAMES.PREFERENCES} />
            <div className="full-page-content">
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