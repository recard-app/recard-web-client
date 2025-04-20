import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../config/firebase';
import './PreferencesModule.scss';

const apiurl = import.meta.env.VITE_BASE_URL;

const CHAT_HISTORY_OPTIONS = [
    { value: 'keep_history', label: 'Keep chat history' },
    { value: 'do_not_track_history', label: 'Do not track chat history' },
    // { value: 'keep_week', label: 'Keep chat history for 1 week' },
    // { value: 'keep_month', label: 'Keep chat history for 1 month' }
];

function PreferencesModule({ 
    initialInstructions, 
    onInstructionsUpdate,
    chatHistoryPreference,
    setChatHistoryPreference
}) {
    const [instructions, setInstructions] = useState(initialInstructions || '');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Load both preferences when component mounts
    useEffect(() => {
        const loadAllPreferences = async () => {
            try {
                const token = await auth.currentUser.getIdToken();
                const headers = {
                    'Authorization': `Bearer ${token}`
                };

                // Load both preferences in parallel
                const [instructionsResponse, chatHistoryResponse] = await Promise.all([
                    axios.get(`${apiurl}/user/preferences_instructions`, { headers }),
                    axios.get(`${apiurl}/user/preferences_chat_history`, { headers })
                ]);

                // Update instructions
                if (instructionsResponse.data.instructions !== undefined) {
                    setInstructions(instructionsResponse.data.instructions);
                    onInstructionsUpdate(instructionsResponse.data.instructions);
                }

                // Update chat history preference
                if (chatHistoryResponse.data.chatHistory) {
                    setChatHistoryPreference(chatHistoryResponse.data.chatHistory);
                }
            } catch (error) {
                console.error('Error loading preferences:', error);
                setMessage('Error loading preferences');
            }
        };

        loadAllPreferences();
    }, []); // Run once when component mounts

    const handleSave = async () => {
        setIsSaving(true);
        setMessage('');

        try {
            const token = await auth.currentUser.getIdToken();
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Save both preferences in parallel
            await Promise.all([
                axios.post(
                    `${apiurl}/user/preferences_instructions`,
                    { instructions },
                    { headers }
                ),
                axios.post(
                    `${apiurl}/user/preferences_chat_history`,
                    { chatHistory: chatHistoryPreference },
                    { headers }
                )
            ]);

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
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Enter your special instructions for the AI assistant..."
                    rows={6}
                    className="preferences-textarea"
                />
                
                <div className="chat-history-preference">
                    <label htmlFor="chatHistorySelect">Chat History Preference:</label>
                    <select
                        id="chatHistorySelect"
                        value={chatHistoryPreference || 'keep_history'}
                        onChange={(e) => setChatHistoryPreference(e.target.value)}
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
