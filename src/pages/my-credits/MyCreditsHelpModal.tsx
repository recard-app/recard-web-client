import React from 'react';

const MyCreditsHelpModal: React.FC = () => {
  return (
    <div className="help-modal-content">
      <section>
        <h3>Credits Overview</h3>
        <p>
          Get a quick overview of your current credit card benefits and rewards. This page shows your
          monthly statistics and current credit usage across all your cards.
        </p>
      </section>

      <section>
        <h3>Monthly Statistics</h3>
        <p>
          The statistics section shows your current month's credit activity:
        </p>
        <ul>
          <li><strong>Used Value:</strong> Total value of credits redeemed this month</li>
          <li><strong>Possible Value:</strong> Total potential credit value available</li>
          <li><strong>Credit Counts:</strong> Number of used, partially used, and unused credits</li>
        </ul>
      </section>

      <section>
        <h3>Current Credits</h3>
        <p>
          View credits for the current period organized by earning frequency:
        </p>
        <ul>
          <li><strong>Monthly Credits:</strong> Benefits that reset each month</li>
          <li><strong>Quarterly Credits:</strong> Benefits that reset every 3 months</li>
          <li><strong>Annual Credits:</strong> Benefits that reset once per year</li>
        </ul>
      </section>

      <section>
        <h3>Quick Actions</h3>
        <p>
          Use the action buttons to manage your credits:
        </p>
        <ul>
          <li><strong>View Full History:</strong> See detailed credit history across all time periods</li>
          <li><strong>Update Credits:</strong> Mark credits as used or partially used</li>
          <li><strong>Track Progress:</strong> Monitor your progress toward earning thresholds</li>
        </ul>
      </section>

      <section>
        <h3>Credit Status Indicators</h3>
        <p>
          Credits are color-coded to show their current status:
        </p>
        <ul>
          <li><strong>Green:</strong> Credit has been fully used</li>
          <li><strong>Yellow:</strong> Credit is partially used</li>
          <li><strong>Blue:</strong> Credit is available but not yet used</li>
          <li><strong>Gray:</strong> Credit is not being tracked</li>
        </ul>
      </section>

      <section>
        <h3>Getting Started</h3>
        <p>
          If this is your first time using credits tracking:
        </p>
        <ul>
          <li>Make sure your credit cards are added in "My Cards"</li>
          <li>Credits are automatically synced based on your card benefits</li>
          <li>Click on any credit to update its usage status</li>
          <li>Visit "Full History" to see detailed historical data</li>
        </ul>
      </section>
    </div>
  );
};

export default MyCreditsHelpModal;


