import React from 'react';

const AskAIPrompts: React.FC = () => {
  return (
    <div className="help-content">
      <h2>Example Prompts</h2>
      <p>
        Copy and paste these prompts to get started, or use them as inspiration.
      </p>

      <h3>Card Recommendations</h3>
      <ul>
        <li>"What card should I use for groceries?"</li>
        <li>"Best card for a $200 dinner?"</li>
        <li>"Which card for booking flights?"</li>
        <li>"Best card for Amazon?"</li>
      </ul>

      <h3>Credit Tracking</h3>
      <ul>
        <li>"What credits do I have available?"</li>
        <li>"Show my expiring credits"</li>
        <li>"Which credits reset this month?"</li>
        <li>"Do I have any unused Uber credits?"</li>
      </ul>

      <h3>Taking Actions</h3>
      <ul>
        <li>"Mark my Uber credit as used"</li>
        <li>"Add the Chase Freedom Flex to my wallet"</li>
        <li>"Freeze my Capital One card"</li>
        <li>"Set my Amex Gold as preferred for dining"</li>
      </ul>

      <h3>Stats & Progress</h3>
      <ul>
        <li>"How much have I saved this month?"</li>
        <li>"What's my credit usage this year?"</li>
        <li>"Show my monthly stats"</li>
      </ul>

      <h3>Strategy & Comparisons</h3>
      <ul>
        <li>"Compare Chase Sapphire Reserve vs Amex Platinum"</li>
        <li>"Is the Amex Gold worth it for me?"</li>
        <li>"What card am I missing in my wallet?"</li>
      </ul>

      <div className="callout callout--tip">
        <strong>Pro tip:</strong> The AI can answer questions and take actions for you. Be specific
        about merchants and amounts for better recommendations.
      </div>
    </div>
  );
};

export default AskAIPrompts;
