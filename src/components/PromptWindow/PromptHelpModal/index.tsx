import React from 'react';
import './PromptHelpModal.scss';

interface PromptHelpModalProps {
  // Add any props here if needed in the future
}

const PromptHelpModal: React.FC<PromptHelpModalProps> = () => {
    return (
        <div className="help-modal">
            <h2>Help</h2>
            <p>This is a help modal where you can find assistance regarding the application.</p>
        </div>
    );
};

export default PromptHelpModal;
