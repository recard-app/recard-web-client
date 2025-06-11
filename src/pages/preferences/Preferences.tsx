import React from 'react';
import PreferencesModule from '../../components/PreferencesModule';
import { ChatHistoryPreference, InstructionsPreference, ShowCompletedOnlyPreference } from '../../types/UserTypes';
import PageHeader from '../../components/PageHeader';
import { useScrollHeight } from '../../hooks/useScrollHeight';
import { PAGE_NAMES } from '../../types';
import { Modal, useModal } from '../../components/Modal';
import PreferencesHelpModal from './PreferencesHelpModal';

interface PreferencesProps {
    preferencesInstructions: InstructionsPreference;
    setPreferencesInstructions: (instructions: InstructionsPreference) => void;
    chatHistoryPreference: ChatHistoryPreference;
    setChatHistoryPreference: (preference: ChatHistoryPreference) => void;
    showCompletedOnlyPreference: ShowCompletedOnlyPreference;
    setShowCompletedOnlyPreference: (preference: ShowCompletedOnlyPreference) => void;
}

const Preferences: React.FC<PreferencesProps> = ({ 
    preferencesInstructions, 
    setPreferencesInstructions,
    chatHistoryPreference,
    setChatHistoryPreference,
    showCompletedOnlyPreference,
    setShowCompletedOnlyPreference
}) => {
    // Use the scroll height hook for this page
    useScrollHeight(true);

    // Help modal
    const helpModal = useModal();

    return (
        <div className="full-page-layout">
            <PageHeader 
                title={PAGE_NAMES.PREFERENCES} 
                showHelpButton={true}
                onHelpClick={helpModal.open}
            />
            <div className="full-page-content">
                <PreferencesModule 
                    customInstructions={preferencesInstructions}
                    onInstructionsUpdate={setPreferencesInstructions}
                    chatHistoryPreference={chatHistoryPreference}
                    setChatHistoryPreference={setChatHistoryPreference}
                    showCompletedOnlyPreference={showCompletedOnlyPreference}
                    setShowCompletedOnlyPreference={setShowCompletedOnlyPreference}
                />
            </div>

            <Modal isOpen={helpModal.isOpen} onClose={helpModal.close}>
                <PreferencesHelpModal />
            </Modal>
        </div>
    );
};

export default Preferences;