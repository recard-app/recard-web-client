import React from 'react';

const CreditsHistoryHelpModal: React.FC = () => {
  return (
    <div className="help-modal-content">
      <section>
        <h3>Credit History Overview</h3>
        <p>
          Track your credit card benefits usage across all time periods. This page shows your complete
          credit history with detailed tracking of earned and redeemed rewards for each card.
        </p>
      </section>

      <section>
        <h3>Navigation Controls</h3>
        <p>
          Use the time controls to view credits from different periods:
        </p>
        <ul>
          <li><strong>Year Selector:</strong> Choose which year to view</li>
          <li><strong>Month Navigation:</strong> Browse through months using the arrows or dropdown</li>
          <li><strong>Current Period Button:</strong> Quickly jump back to the current month</li>
        </ul>
      </section>

      <section>
        <h3>Credit Status Types</h3>
        <p>
          Credits are displayed with different status indicators:
        </p>
        <ul>
          <li><strong>Used:</strong> Credit has been fully redeemed</li>
          <li><strong>Not Used:</strong> Credit is available but hasn't been used yet</li>
          <li><strong>Partially Used:</strong> Some of the credit value has been redeemed</li>
          <li><strong>Inactive:</strong> Credit is not being tracked (hidden from calculations)</li>
        </ul>
      </section>

      <section>
        <h3>Filtering Options</h3>
        <p>
          Customize your view using the available filters:
        </p>
        <ul>
          <li><strong>Credits to Show:</strong> Toggle which status types are visible</li>
          <li><strong>Filter by Card:</strong> View credits for a specific card only</li>
          <li><strong>Reset Filters:</strong> Return to default view showing all credits</li>
        </ul>
      </section>

      <section>
        <h3>Credit Periods</h3>
        <p>
          Credits are organized by their earning periods:
        </p>
        <ul>
          <li><strong>Monthly:</strong> Earn each month of the year</li>
          <li><strong>Quarterly:</strong> Earn every 3 months (Q1, Q2, Q3, Q4)</li>
          <li><strong>Semiannual:</strong> Earn twice per year (every 6 months)</li>
          <li><strong>Annual:</strong> Earn once per year</li>
        </ul>
      </section>

      <section>
        <h3>Managing Credits</h3>
        <p>
          Click on any credit entry to:
        </p>
        <ul>
          <li>Update usage status and amount used</li>
          <li>View detailed credit information</li>
          <li>See when credits expire</li>
          <li>Track spending progress toward earning thresholds</li>
        </ul>
      </section>
    </div>
  );
};

export default CreditsHistoryHelpModal;