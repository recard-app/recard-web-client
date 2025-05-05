import React, { useState, useEffect } from 'react';
import { ChatHistoryPreference, InstructionsPreference } from '../../types/UserTypes';
import { UserPreferencesService } from '../../services';
import { CHAT_HISTORY_OPTIONS } from './utils';
import './PreferencesModule.scss';

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
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        const loadAllPreferences = async () => {
            try {
                const { instructionsResponse, chatHistoryResponse } = 
                    await UserPreferencesService.loadAllPreferences();

                // Update custom instructions
                if (instructionsResponse.instructions !== undefined) {
                    setInstructions(instructionsResponse.instructions);
                    onInstructionsUpdate(instructionsResponse.instructions);
                }

                // Update chat history preference
                if (chatHistoryResponse.chatHistory) {
                    setChatHistoryPreference(chatHistoryResponse.chatHistory);
                }
            } catch (error) {
                console.error('Error loading preferences:', error);
                setMessage('Error loading preferences');
            }
        };

        loadAllPreferences();
    }, []);

    /**
     * Handles saving user preferences.
     */
    const handleSave = async (): Promise<void> => {
        setIsSaving(true);
        setMessage('');

        try {
            await UserPreferencesService.savePreferences(instructions, chatHistoryPreference);
            setMessage('All preferences saved successfully!');
            onInstructionsUpdate(instructions);
        } catch (error) {
            console.error('Error saving preferences:', error);
            setMessage('Error saving preferences');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="preferences-module">
            <h2>Special Instructions</h2>
            <div className="preferences-content">
                <textarea
                    value={instructions}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInstructions(e.target.value)}
                    placeholder="Enter your special instructions for the AI assistant..."
                    rows={6}
                    className="preferences-textarea"
                />
                
                <div className="chat-history-preference">
                    <label htmlFor="chatHistorySelect">Chat History Preference:</label>
                    <select
                        id="chatHistorySelect"
                        value={chatHistoryPreference || 'keep_history'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                            setChatHistoryPreference(e.target.value as ChatHistoryPreference)}
                        className="chat-history-select"
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
                    disabled={isSaving}
                    className="save-button"
                >
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                </button>
                {message && (
                    <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PreferencesModule;
