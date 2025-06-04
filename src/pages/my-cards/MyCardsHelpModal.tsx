import React from 'react';

const MyCardsHelpModal: React.FC = () => {
  return (
    <div className="help-modal-content">
      <h2>My Cards Help</h2>
      
      <section>
        <h3>Adding Credit Cards</h3>
        <p>
          Add your credit cards to get personalized recommendations based on your existing cards' 
          benefits and reward structures. Your card information helps the AI suggest optimal 
          spending strategies and identify opportunities for better rewards.
        </p>
      </section>

      <section>
        <h3>Card Information</h3>
        <p>
          For each card, you can provide:
        </p>
        <ul>
          <li><strong>Card Name:</strong> A custom name to identify your card</li>
          <li><strong>Bank/Issuer:</strong> The financial institution that issued the card</li>
          <li><strong>Card Type:</strong> Visa, Mastercard, American Express, etc.</li>
          <li><strong>Reward Categories:</strong> Special bonus categories for this card</li>
          <li><strong>Annual Fee:</strong> Any yearly costs associated with the card</li>
        </ul>
      </section>

      <section>
        <h3>Managing Your Cards</h3>
        <p>
          Use the card management interface to:
        </p>
        <ul>
          <li>Edit existing card details</li>
          <li>Remove cards you no longer use</li>
          <li>Set primary cards for different spending categories</li>
          <li>Update reward program information</li>
        </ul>
      </section>

      <section>
        <h3>Privacy & Security</h3>
        <p>
          Your card information is used only to provide personalized recommendations. 
          We don't store sensitive information like card numbers or security codes. 
          Only the details you provide about rewards and benefits are saved.
        </p>
      </section>

      <section>
        <h3>Recommendations</h3>
        <p>
          Once you've added your cards, the AI will use this information to:
        </p>
        <ul>
          <li>Suggest which card to use for specific purchases</li>
          <li>Identify gaps in your rewards portfolio</li>
          <li>Recommend new cards that complement your existing setup</li>
          <li>Calculate potential rewards for different spending scenarios</li>
        </ul>
      </section>
    </div>
  );
};

export default MyCardsHelpModal; 