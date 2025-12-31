import React from 'react';

const AskAIPrompts: React.FC = () => {
  return (
    <div className="help-content">
      <h2>Example Prompts</h2>
      <p>
        Copy and paste these prompts to get started, or use them as inspiration for your own questions.
      </p>

      <h3>Everyday Spending</h3>
      <ul>
        <li>"What card should I use for groceries at Costco?"</li>
        <li>"Best card for my $50 Netflix subscription?"</li>
        <li>"Which card for a $200 restaurant dinner?"</li>
        <li>"Best card for online shopping on Amazon?"</li>
        <li>"What should I use for gas at Costco?"</li>
        <li>"Best card for pharmacy purchases?"</li>
      </ul>

      <h3>Travel</h3>
      <ul>
        <li>"What's my best card for booking flights?"</li>
        <li>"Should I use my Sapphire or Venture for hotels?"</li>
        <li>"Best card for international purchases?"</li>
        <li>"Which card has the best rental car insurance?"</li>
        <li>"Best card for Airbnb bookings?"</li>
        <li>"What card should I use at the airport?"</li>
      </ul>

      <h3>Strategy Questions</h3>
      <ul>
        <li>"Is the Amex Gold worth $250/year for me?"</li>
        <li>"What card am I missing in my wallet?"</li>
        <li>"How should I split a $500 purchase for maximum points?"</li>
        <li>"Should I downgrade my Sapphire Reserve to a Freedom?"</li>
        <li>"What's the best way to use my credits this month?"</li>
        <li>"How can I maximize my points for a trip to Europe?"</li>
      </ul>

      <h3>Comparisons</h3>
      <ul>
        <li>"Compare Chase Sapphire Reserve vs Amex Platinum for travel"</li>
        <li>"Which is better for dining: Amex Gold or Capital One Savor?"</li>
        <li>"Compare my cards for grocery spending"</li>
        <li>"What's the difference between my cashback and points cards?"</li>
      </ul>

      <h3>Specific Scenarios</h3>
      <ul>
        <li>"I'm buying a $1,500 laptop - which card and why?"</li>
        <li>"Planning a $3,000 vacation - how should I pay?"</li>
        <li>"I have $10,000 in expenses this month - optimize my spending"</li>
        <li>"Which card for a business dinner at a high-end restaurant?"</li>
      </ul>

      <div className="callout callout--tip">
        <strong>Pro tip:</strong> The more specific you are about the merchant, amount, and your goals,
        the better the recommendation will be.
      </div>
    </div>
  );
};

export default AskAIPrompts;
