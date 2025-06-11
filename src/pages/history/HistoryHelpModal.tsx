import React from 'react';

const HistoryHelpModal: React.FC = () => {
  return (
    <div className="help-modal-content">
      <section>
        <h3>View Monthly Statement</h3>
        <p>
          Use the year and month filters to view transactions from specific time periods. 
          This is helpful for reviewing your spending patterns or finding specific transactions.
        </p>
        <ul>
          <li>Select a year from the dropdown</li>
          <li>Choose a month to filter transactions</li>
          <li>Click the "×" button to clear filters and return to the full view</li>
        </ul>
      </section>

      <section>
        <h3>Show Completed Transactions Only</h3>
        <p>
          Toggle this option to filter your view to show only completed transactions. 
          This helps focus on finalized purchases and exclude pending or cancelled transactions.
        </p>
      </section>

      <section>
        <h3>Navigation</h3>
        <p>
          Navigate through your transaction history using the pagination controls at the bottom:
        </p>
        <ul>
          <li><strong>«« / »»</strong> - Jump to first/last page</li>
          <li><strong>‹ / ›</strong> - Go to previous/next page</li>
          <li><strong>Numbers</strong> - Jump to specific pages</li>
        </ul>
      </section>

      <section>
        <h3>Transaction Details</h3>
        <p>
          Each transaction entry shows key information about your chat conversations, 
          including timestamps, recommendations made, and any credit cards discussed. 
          Click on entries to view full conversation details.
        </p>
      </section>

      <section>
        <h3>Subscription Limits</h3>
        <p>
          Free accounts can view the last 7 days of transaction history. 
          Upgrade to access your complete transaction history and advanced filtering options.
        </p>
      </section>
    </div>
  );
};

export default HistoryHelpModal; 