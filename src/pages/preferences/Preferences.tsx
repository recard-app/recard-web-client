import React, { useState } from 'react';
import PreferencesModule from '../../components/PreferencesModule';
import { ChatHistoryPreference, InstructionsPreference, ShowCompletedOnlyPreference } from '../../types/UserTypes';
import PageHeader from '../../components/PageHeader';
import { useScrollHeight } from '../../hooks/useScrollHeight';
import { PAGE_NAMES, PAGE_ICONS } from '../../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '../../components/ui/dialog/dialog';
import PreferencesHelpModal from './PreferencesHelpModal';
import ContentContainer from '../../components/ContentContainer';

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

    // Help modal state
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    return (
        <div className="full-page-layout">
            <PageHeader 
                title={PAGE_NAMES.PREFERENCES} 
                icon={PAGE_ICONS.PREFERENCES.MINI}
                showHelpButton={true}
                onHelpClick={() => setIsHelpOpen(true)}
            />
            <div className="full-page-content">
                <ContentContainer size="md" framed>
                    <PreferencesModule 
                        customInstructions={preferencesInstructions}
                        onInstructionsUpdate={setPreferencesInstructions}
                        chatHistoryPreference={chatHistoryPreference}
                        setChatHistoryPreference={setChatHistoryPreference}
                        showCompletedOnlyPreference={showCompletedOnlyPreference}
                        setShowCompletedOnlyPreference={setShowCompletedOnlyPreference}
                    />
                </ContentContainer>
            </div>

            <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Preferences Help</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <PreferencesHelpModal />
                    </DialogBody>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Preferences;