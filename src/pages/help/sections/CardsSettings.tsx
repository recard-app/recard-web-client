import React from 'react';

const CardsSettings: React.FC = () => {
  return (
    <div className="help-content">
      <h2>Card Settings</h2>
      <p>
        Customize how each card behaves in recommendations and credit tracking.
      </p>

      <h3>Preferred Cards</h3>
      <p>
        Mark a card as your go-to for specific spending categories. When you set a card as preferred,
        the AI will prioritize it in recommendations for that category.
      </p>
      <p><strong>When to use:</strong></p>
      <ul>
        <li>You always want to use Card X for dining</li>
        <li>You have a default for everyday purchases</li>
        <li>You're working toward a spending bonus on a specific card</li>
      </ul>
      <p><strong>How to set:</strong></p>
      <ol>
        <li>Go to My Cards</li>
        <li>Click on the card you want to set as preferred</li>
        <li>Click "Set as Preferred"</li>
        <li>Choose the category</li>
      </ol>

      <h3>Freezing Cards</h3>
      <p>
        Temporarily exclude a card from AI recommendations without removing it from your account.
        The card will still appear in your portfolio, but it won't be suggested for purchases.
      </p>
      <p><strong>When to use:</strong></p>
      <ul>
        <li>Card is in a drawer and you're not actively using it</li>
        <li>You're considering whether to cancel and want to see life without it</li>
        <li>Taking a break from a card (e.g., sock drawer method)</li>
        <li>You lost your card or are waiting for a replacement</li>
      </ul>
      <p><strong>How to freeze:</strong></p>
      <ol>
        <li>Go to My Cards</li>
        <li>Click on the card you want to freeze</li>
        <li>Click "Freeze Card"</li>
      </ol>
      <p><strong>How to unfreeze:</strong></p>
      <ol>
        <li>Go to My Cards</li>
        <li>Click on the frozen card</li>
        <li>Click "Unfreeze Card"</li>
      </ol>

      <h3>Disabling Components</h3>
      <p>
        Each card has components like multipliers, credits, and perks. You can disable individual
        components without affecting the rest of the card. When a component is disabled, it won't
        appear in AI recommendations or credit tracking, but the card itself remains active.
      </p>
      <p><strong>When to use:</strong></p>
      <ul>
        <li>You've hit a category cap and want to stop getting suggestions for that multiplier</li>
        <li>A credit doesn't apply to your spending habits</li>
        <li>You don't use a particular perk and want to reduce clutter</li>
        <li>A multiplier has restrictions that don't work for you (e.g., specific merchants only)</li>
      </ul>
      <p><strong>How it works:</strong></p>
      <ul>
        <li>Disabled components are hidden from recommendations and dashboards</li>
        <li>The card's other components continue working normally</li>
        <li>You can re-enable a component at any time</li>
        <li>Disabling a credit will remove it from your tracking totals</li>
      </ul>
      <p><strong>How to disable:</strong></p>
      <ol>
        <li>Go to My Cards</li>
        <li>Click on the card</li>
        <li>Find the component you want to disable</li>
        <li>Click the hide/disable toggle</li>
      </ol>

      <h3>Anniversary Dates</h3>
      <p>
        Your card's anniversary date is when you opened the account. This is important for
        credits that reset on your anniversary rather than the calendar year.
      </p>
      <p><strong>Why it matters:</strong></p>
      <ul>
        <li>Some credits reset on your anniversary, not January 1</li>
        <li>Your annual fee typically posts on this date</li>
        <li>Helps track how long you've had the card</li>
        <li>Important for downgrade/upgrade timing</li>
      </ul>
      <p><strong>How to set:</strong></p>
      <ol>
        <li>Go to My Cards</li>
        <li>Click on the card</li>
        <li>Click "Set Anniversary Date"</li>
        <li>Enter the month and day you opened the account</li>
      </ol>

      <div className="callout callout--tip">
        <strong>Don't know your anniversary date?</strong> Check your credit card statement
        or log into your card issuer's website - it's usually shown in account details.
      </div>

      <h3>Removing Cards</h3>
      <p>
        If you've closed a card or no longer want to track it, you can remove it from your account.
      </p>
      <p><strong>How to remove:</strong></p>
      <ol>
        <li>Go to My Cards</li>
        <li>Click on the card you want to remove</li>
        <li>Click "Remove Card"</li>
        <li>Confirm the removal</li>
      </ol>

      <div className="callout callout--warning">
        <strong>Note:</strong> Removing a card will also remove its credit tracking history.
        If you might want the card back later, consider freezing it instead.
      </div>
    </div>
  );
};

export default CardsSettings;
