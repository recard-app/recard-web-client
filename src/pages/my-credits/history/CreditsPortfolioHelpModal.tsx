import React from 'react';

const CreditsPortfolioHelpModal: React.FC = () => {
  return (
    <div className="help-modal-content">
      <section>
        <h3>Credit History View</h3>
        <p>
          The Credit History view shows all your credit card credits organized by card.
          Use this view to see a comprehensive overview of your credit usage across all cards.
        </p>
      </section>

      <section>
        <h3>Year Selection</h3>
        <p>
          Use the year dropdown to view credit history for different years.
          Credits are organized by calendar year for most cards, or by anniversary year
          for anniversary-based credits.
        </p>
      </section>

      <section>
        <h3>Card Accordions</h3>
        <p>
          Each card is displayed as an expandable accordion. Click on a card to expand
          and see all its credits. The header shows a summary of total credits used
          and the percentage of total value redeemed.
        </p>
      </section>

      <section>
        <h3>Period Indicators</h3>
        <p>
          Each credit shows period indicators for monthly, quarterly, semi-annual, or annual periods.
          Click on any period indicator to open the credit details modal and update your usage.
        </p>
        <ul>
          <li><strong>Green checkmark:</strong> Fully redeemed</li>
          <li><strong>Yellow partial:</strong> Partially used</li>
          <li><strong>Empty circle:</strong> Not yet used</li>
          <li><strong>Gray dashed:</strong> Future period or inactive</li>
        </ul>
      </section>

      <section>
        <h3>Anniversary-Based Credits</h3>
        <p>
          Some credits reset on your card's anniversary date rather than the calendar year.
          These credits show the date range (e.g., "Mar 14, 2024 - Mar 13, 2025") and
          indicate if the period extends into the next calendar year.
        </p>
      </section>
    </div>
  );
};

export default CreditsPortfolioHelpModal;
