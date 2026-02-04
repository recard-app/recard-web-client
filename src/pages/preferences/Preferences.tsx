import React from 'react';
import PreferencesModule from '../../components/PreferencesModule';
import { ChatHistoryPreference, InstructionsPreference } from '../../types/UserTypes';
import PageHeader from '../../components/PageHeader';
import { useFullHeight } from '../../hooks/useFullHeight';
import { PAGE_NAMES, PAGE_ICONS } from '../../types';
import ContentContainer from '../../components/ContentContainer';

interface PreferencesProps {
    preferencesInstructions: InstructionsPreference;
    setPreferencesInstructions: (instructions: InstructionsPreference) => void;
    chatHistoryPreference: ChatHistoryPreference;
    setChatHistoryPreference: (preference: ChatHistoryPreference) => void;
}

const Preferences: React.FC<PreferencesProps> = ({
    preferencesInstructions,
    setPreferencesInstructions,
    chatHistoryPreference,
    setChatHistoryPreference,
}) => {
    // Use the full height hook to prevent double scroll
    useFullHeight(true);

    return (
        <div className="full-page-layout">
            <PageHeader
                title={PAGE_NAMES.PREFERENCES}
                icon={PAGE_ICONS.PREFERENCES.MINI}
            />
            <div className="full-page-content">
                <ContentContainer size="md">
                    <PreferencesModule
                        customInstructions={preferencesInstructions}
                        onInstructionsUpdate={setPreferencesInstructions}
                        chatHistoryPreference={chatHistoryPreference}
                        setChatHistoryPreference={setChatHistoryPreference}
                    />
                </ContentContainer>
            </div>
        </div>
    );
};

export default Preferences;