import React from 'react';
import './PromptHelpModal.scss';

interface PromptHelpModalProps {
  // Add any props here if needed in the future
}

const PromptHelpModal: React.FC<PromptHelpModalProps> = () => {
    return (
        <div className="help-modal">
            <h2>How to Use the Card Recommendation Chat</h2>
            <ul>
                <li><strong>Ask for recommendations:</strong> Type your goals or spending habits (e.g., "What’s the best card for groceries and travel?").</li>
                <li><strong>Be specific:</strong> Mention if you want cash back, travel rewards, or have a preferred issuer.</li>
                <li><strong>Compare cards:</strong> You can ask to compare two or more cards (e.g., "Compare Chase Sapphire Preferred and Amex Gold").</li>
                <li><strong>Personalize:</strong> Share your credit score range or annual fee preferences for tailored suggestions.</li>
                <li><strong>History:</strong> Your previous chats are saved for easy reference. Start a new chat for a new scenario.</li>
                <li><strong>Privacy:</strong> No sensitive personal info is required—just your preferences and goals!</li>
            </ul>
            <p>Need more help? Try asking, "How do I get the most points for travel?" or "Which card is best for dining out?"</p>
        </div>
    );
};

export default PromptHelpModal;