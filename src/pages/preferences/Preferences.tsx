import React from 'react';
import PreferencesModule from '../../components/PreferencesModule';
import { AgentModePreference, ChatHistoryPreference, InstructionsPreference } from '../../types/UserTypes';
import PageHeader from '../../components/PageHeader';
import { useFullHeight } from '../../hooks/useFullHeight';
import { PAGE_NAMES, PAGE_ICONS } from '../../types';
import ContentContainer from '../../components/ContentContainer';
import { useRegisterScrollContainer } from '@/contexts/PageScrollContext';
import './Preferences.scss';

interface PreferencesProps {
    preferencesInstructions: InstructionsPreference;
    setPreferencesInstructions: (instructions: InstructionsPreference) => void;
    chatHistoryPreference: ChatHistoryPreference;
    setChatHistoryPreference: (preference: ChatHistoryPreference) => void;
    agentModePreference: AgentModePreference;
    setAgentModePreference: (mode: AgentModePreference) => void;
}

const Preferences: React.FC<PreferencesProps> = ({
    preferencesInstructions,
    setPreferencesInstructions,
    chatHistoryPreference,
    setChatHistoryPreference,
    agentModePreference,
    setAgentModePreference,
}) => {
    // Use the full height hook to prevent double scroll
    useFullHeight(true);
    const registerScrollContainer = useRegisterScrollContainer();

    return (
        <div className="full-page-layout preferences-page">
            <PageHeader
                title={PAGE_NAMES.PREFERENCES}
                icon={PAGE_ICONS.PREFERENCES.MINI}
            />
            <div className="full-page-content" ref={registerScrollContainer}>
                <ContentContainer size="md">
                    <PreferencesModule
                        customInstructions={preferencesInstructions}
                        onInstructionsUpdate={setPreferencesInstructions}
                        chatHistoryPreference={chatHistoryPreference}
                        setChatHistoryPreference={setChatHistoryPreference}
                        agentModePreference={agentModePreference}
                        setAgentModePreference={setAgentModePreference}
                    />
                </ContentContainer>
            </div>
        </div>
    );
};

export default Preferences;