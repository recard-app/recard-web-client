import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ChatHistoryPreference, InstructionsPreference } from '../../types/UserTypes';
import { UserPreferencesService } from '../../services';
import { CHAT_HISTORY_OPTIONS } from './utils';
import { LOADING_ICON, LOADING_ICON_SIZE } from '../../types/Constants';
import './PreferencesModule.scss';
import { InfoDisplay } from '../../elements';

/**
 * Props interface for PreferencesModule component.
 *
 * @param customInstructions - Initial instructions passed to the component.
 * @param onInstructionsUpdate - Callback to update instructions.
 * @param chatHistoryPreference - Current chat history preference.
 * @param setChatHistoryPreference - Function to set chat history preference.
 */
interface PreferencesModuleProps {
    customInstructions: InstructionsPreference;
    onInstructionsUpdate: (instructions: InstructionsPreference) => void;
    chatHistoryPreference: ChatHistoryPreference;
    setChatHistoryPreference: (preference: ChatHistoryPreference) => void;
}

function PreferencesModule({
    customInstructions,
    onInstructionsUpdate,
    chatHistoryPreference,
    setChatHistoryPreference
}: PreferencesModuleProps) {
    const [instructions, setInstructions] = useState<string>(customInstructions || '');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadAllPreferences = async () => {
            setIsLoading(true);
            try {
                const response = await UserPreferencesService.loadAllPreferences();

                // Update custom instructions
                if (response.instructions !== undefined) {
                    setInstructions(response.instructions);
                    onInstructionsUpdate(response.instructions);
                }

                // Update chat history preference
                if (response.chatHistory) {
                    setChatHistoryPreference(response.chatHistory);
                }
            } catch (error) {
                console.error('Error loading preferences:', error);
                toast.error('Error loading preferences');
            } finally {
                setIsLoading(false);
            }
        };

        loadAllPreferences();
    }, []);

    /**
     * Handles saving user preferences.
     */
    const handleSave = async (): Promise<void> => {
        setIsSaving(true);

        try {
            await UserPreferencesService.savePreferences(instructions, chatHistoryPreference);
            toast.success('All preferences saved successfully!');
            onInstructionsUpdate(instructions);
        } catch (error) {
            console.error('Error saving preferences:', error);
            toast.error('Error saving preferences. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="preferences-module">
            <h2>Special Instructions</h2>
            {isLoading && (
                <div className="loading-overlay">
                    <InfoDisplay
                        type="loading"
                        message="Loading preferences..."
                        showTitle={false}
                        transparent={true}
                    />
                </div>
            )}
            <div className="preferences-content">
                <textarea
                    value={instructions}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInstructions(e.target.value)}
                    placeholder={isLoading ? "Loading instructions..." : "Enter your special instructions for the ReCard AI assistant..."}
                    rows={6}
                    className={`preferences-textarea default-textarea ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                />
                
                <div className="chat-history-preference">
                    <label htmlFor="chatHistorySelect">Chat History Preference:</label>
                    <select
                        id="chatHistorySelect"
                        value={chatHistoryPreference || 'keep_history'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                            setChatHistoryPreference(e.target.value as ChatHistoryPreference)}
                        className={`chat-history-select default-select ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {CHAT_HISTORY_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving || isLoading}
                    className={`save-button ${isSaving ? 'loading icon with-text' : ''}`}
                >
                    {isSaving && <LOADING_ICON size={LOADING_ICON_SIZE} />}
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                </button>
            </div>
        </div>
    );
}

export default PreferencesModule;
