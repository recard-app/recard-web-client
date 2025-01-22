import React from 'react';
import './PreferencesModule.scss';

const PreferencesModule = () => {
    return (
        <div className="preferences-container">
            <h2>User Preferences</h2>
            <div className="preferences-content">
                <div className="preference-section">
                    <h3>Display Settings</h3>
                    <div className="preference-item">
                        <label>Theme</label>
                        <select>
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>
                </div>

                <div className="preference-section">
                    <h3>Notification Settings</h3>
                    <div className="preference-item">
                        <label>Email Notifications</label>
                        <input type="checkbox" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreferencesModule;
