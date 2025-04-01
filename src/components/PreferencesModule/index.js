import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../config/firebase';
import './PreferencesModule.scss';

const apiurl = process.env.REACT_APP_BASE_URL;

function PreferencesModule({ initialInstructions, onInstructionsUpdate }) {
    const [instructions, setInstructions] = useState(initialInstructions || '');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Load existing preferences when component mounts
    useEffect(() => {
        setInstructions(initialInstructions || '');
    }, [initialInstructions]);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage('');

        try {
            const token = await auth.currentUser.getIdToken();
            await axios.post(
                `${apiurl}/user/preferences_instructions`,
                { instructions },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            setMessage('Preferences saved successfully!');
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
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="save-button"
                >
                    {isSaving ? 'Saving...' : 'Save Instructions'}
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
