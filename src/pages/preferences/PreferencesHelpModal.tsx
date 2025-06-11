import React from 'react';

const PreferencesHelpModal: React.FC = () => {
  return (
    <div className="help-modal-content">
      <section>
        <h3>Custom Instructions</h3>
        <p>
          Use this field to provide specific instructions about your spending preferences, 
          financial goals, or any other context that will help generate better recommendations. 
          For example: "I prefer cashback over travel rewards" or "I want to build credit history."
        </p>
      </section>

      <section>
        <h3>Chat History</h3>
        <p>
          Choose whether to keep your conversation history or clear it after each session:
        </p>
        <ul>
          <li><strong>Keep History:</strong> Maintains context across conversations for better recommendations</li>
          <li><strong>Clear History:</strong> Starts fresh each time for privacy</li>
        </ul>
      </section>

      <section>
        <h3>Show Completed Only</h3>
        <p>
          Toggle this option to filter your transaction history to show only completed transactions. 
          This affects what appears in your history view and can help focus on finalized purchases.
        </p>
      </section>
    </div>
  );
};

export default PreferencesHelpModal; 