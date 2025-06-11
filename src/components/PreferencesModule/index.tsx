import React, { useState, useEffect } from 'react';
import { ChatHistoryPreference, InstructionsPreference, ShowCompletedOnlyPreference } from '../../types/UserTypes';
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
    showCompletedOnlyPreference: ShowCompletedOnlyPreference;
    setShowCompletedOnlyPreference: (preference: ShowCompletedOnlyPreference) => void;
}

function PreferencesModule({ 
    customInstructions, 
    onInstructionsUpdate,
    chatHistoryPreference,
    setChatHistoryPreference,
    showCompletedOnlyPreference,
    setShowCompletedOnlyPreference
}: PreferencesModuleProps) {
    const [instructions, setInstructions] = useState<string>(customInstructions || '');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [message, setMessage] = useState<string>('');
    const [messageType, setMessageType] = useState<'error' | 'success' | 'info' | 'warning'>('info');

    useEffect(() => {
        const loadAllPreferences = async () => {
            setIsLoading(true);
            try {
                const { instructionsResponse, chatHistoryResponse, showCompletedOnlyResponse } = 
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

                // Update show completed only preference
                if (showCompletedOnlyResponse.showCompletedOnly !== undefined) {
                    setShowCompletedOnlyPreference(showCompletedOnlyResponse.showCompletedOnly);
                }
            } catch (error) {
                console.error('Error loading preferences:', error);
                setMessage('Error loading preferences');
                setMessageType('error');
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
        setMessage('');

        try {
            await UserPreferencesService.savePreferences(instructions, chatHistoryPreference, showCompletedOnlyPreference);
            setMessage('All preferences saved successfully!');
            setMessageType('success');
            onInstructionsUpdate(instructions);
        } catch (error) {
            console.error('Error saving preferences:', error);
            setMessage('Error saving preferences');
            setMessageType('error');
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
                    className={`preferences-textarea ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                />
                
                <div className="chat-history-preference">
                    <label htmlFor="chatHistorySelect">Chat History Preference:</label>
                    <select
                        id="chatHistorySelect"
                        value={chatHistoryPreference || 'keep_history'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                            setChatHistoryPreference(e.target.value as ChatHistoryPreference)}
                        className={`chat-history-select ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {CHAT_HISTORY_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="show-completed-preference">
                    <label htmlFor="showCompletedSelect">Transaction Display Preference:</label>
                    <select
                        id="showCompletedSelect"
                        value={showCompletedOnlyPreference.toString()}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                            setShowCompletedOnlyPreference(e.target.value === 'true')}
                        className={`show-completed-select ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        <option value="false">Show all transactions</option>
                        <option value="true">Only show completed transactions</option>
                    </select>
                </div>

                <button 
                    onClick={handleSave}
                    disabled={isSaving || isLoading}
                    className={`save-button ${isSaving ? 'loading icon' : ''}`}
                >
                    {isSaving && <LOADING_ICON size={LOADING_ICON_SIZE} />}
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                </button>

                {message && (
                    <InfoDisplay
                        type={messageType}
                        message={message}
                    />
                )}
            </div>
        </div>
    );
}

export default PreferencesModule;
