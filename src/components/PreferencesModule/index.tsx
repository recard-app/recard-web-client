import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ChatHistoryPreference, InstructionsPreference, ChatModePreference } from '../../types/UserTypes';
import { UserPreferencesService } from '../../services';
import { CHAT_HISTORY_OPTIONS, CHAT_MODE_OPTIONS, CHAT_MODE_STORAGE_KEY } from './utils';
import { LOADING_ICON, LOADING_ICON_SIZE, SPECIAL_INSTRUCTIONS_MAX_LENGTH, DEFAULT_CHAT_MODE } from '../../types/Constants';
import './PreferencesModule.scss';
import { InfoDisplay, ErrorWithRetry } from '../../elements';

/**
 * Props interface for PreferencesModule component.
 *
 * @param customInstructions - Initial instructions passed to the component.
 * @param onInstructionsUpdate - Callback to update instructions.
 * @param chatHistoryPreference - Current chat history preference.
 * @param setChatHistoryPreference - Function to set chat history preference.
 * @param chatMode - Current chat mode preference.
 * @param setChatMode - Function to set chat mode preference.
 */
interface PreferencesModuleProps {
    customInstructions: InstructionsPreference;
    onInstructionsUpdate: (instructions: InstructionsPreference) => void;
    chatHistoryPreference: ChatHistoryPreference;
    setChatHistoryPreference: (preference: ChatHistoryPreference) => void;
    chatMode: ChatModePreference;
    setChatMode: (mode: ChatModePreference) => void;
}

function PreferencesModule({
    customInstructions,
    onInstructionsUpdate,
    chatHistoryPreference,
    setChatHistoryPreference,
    chatMode,
    setChatMode
}: PreferencesModuleProps) {
    const [instructions, setInstructions] = useState<string>(customInstructions || '');
    const [pendingChatMode, setPendingChatMode] = useState<ChatModePreference>(chatMode);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Sync pending chat mode when prop changes (e.g., on load)
    useEffect(() => {
        setPendingChatMode(chatMode);
    }, [chatMode]);

    const isOverLimit = instructions.length > SPECIAL_INSTRUCTIONS_MAX_LENGTH;

    const getCounterClass = (): string => {
        const length = instructions.length;
        if (length > SPECIAL_INSTRUCTIONS_MAX_LENGTH) return 'error';
        if (length > SPECIAL_INSTRUCTIONS_MAX_LENGTH * 0.9) return 'warning';
        return '';
    };

    const loadAllPreferences = async () => {
        setIsLoading(true);
        setLoadError(null);
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
            setLoadError('Failed to load preferences. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAllPreferences();
    }, []);

    /**
     * Handles chat mode change - updates pending state only, saved on Save button click
     */
    const handleChatModeChange = (mode: ChatModePreference): void => {
        setPendingChatMode(mode);
    };

    /**
     * Handles saving user preferences.
     */
    const handleSave = async (): Promise<void> => {
        if (isOverLimit) {
            toast.error(`Special instructions must be ${SPECIAL_INSTRUCTIONS_MAX_LENGTH} characters or less.`);
            return;
        }

        setIsSaving(true);

        try {
            await UserPreferencesService.savePreferences(instructions, chatHistoryPreference);

            // Save chat mode to localStorage and update state
            setChatMode(pendingChatMode);
            localStorage.setItem(CHAT_MODE_STORAGE_KEY, pendingChatMode);

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
            {loadError ? (
                <ErrorWithRetry
                    message={loadError}
                    onRetry={loadAllPreferences}
                    fillContainer
                />
            ) : isLoading ? (
                <div className="loading-overlay">
                    <InfoDisplay
                        type="loading"
                        message="Loading preferences..."
                        showTitle={false}
                        transparent={true}
                    />
                </div>
            ) : null}
            <div className="preferences-content" style={{ display: loadError ? 'none' : 'block' }}>
                <div className="special-instructions-field">
                    <textarea
                        value={instructions}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInstructions(e.target.value)}
                        placeholder={isLoading ? "Loading instructions..." : "Enter your special instructions for the ReCard AI assistant..."}
                        rows={6}
                        className={`preferences-textarea default-textarea ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    />
                    <div className={`character-counter ${getCounterClass()}`}>
                        {instructions.length} / {SPECIAL_INSTRUCTIONS_MAX_LENGTH}
                    </div>
                </div>

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

                <div className="chat-mode-preference">
                    <label htmlFor="chatModeSelect">AI Mode (Beta):</label>
                    <select
                        id="chatModeSelect"
                        value={pendingChatMode || DEFAULT_CHAT_MODE}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            handleChatModeChange(e.target.value as ChatModePreference)}
                        className="chat-mode-select default-select"
                    >
                        {CHAT_MODE_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <p className="chat-mode-description">
                        {CHAT_MODE_OPTIONS.find(opt => opt.value === pendingChatMode)?.description || ''}
                    </p>
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
