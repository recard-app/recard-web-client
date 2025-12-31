import React from 'react';
import { Link } from 'react-router-dom';
import { PAGES } from '../../../types/Pages';

const CreditsHistory: React.FC = () => {
  return (
    <div className="help-content">
      <h2>Credit History</h2>
      <p>
        View your complete credit usage history in the{' '}
        <Link to={PAGES.MY_CREDITS_HISTORY.PATH} className="nav-path">All Credits</Link> view.
      </p>

      <h3>Portfolio View</h3>
      <p>
        The credit history page shows all your credits organized by card, with each period
        displayed as a visual indicator.
      </p>

      <h4>How to Use</h4>
      <ol>
        <li>Select the year you want to view</li>
        <li>Expand a card to see its credits</li>
        <li>Each credit shows all periods for that year</li>
        <li>Click on a period to see details or update status</li>
      </ol>

      <h3>Period Indicators</h3>
      <table>
        <thead>
          <tr>
            <th>Indicator</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span className="status-indicator status-indicator--green">Green checkmark</span></td>
            <td>Fully redeemed</td>
          </tr>
          <tr>
            <td><span className="status-indicator status-indicator--yellow">Yellow partial</span></td>
            <td>Partially used</td>
          </tr>
          <tr>
            <td><span className="status-indicator status-indicator--blue">Blue circle</span></td>
            <td>Available (current period)</td>
          </tr>
          <tr>
            <td><span className="status-indicator status-indicator--gray">Gray dashed</span></td>
            <td>Future period or inactive</td>
          </tr>
        </tbody>
      </table>

      <h3>Understanding Time Periods</h3>

      <h4>Monthly Credits</h4>
      <p>
        Shows 12 columns, one for each month. Labeled as "Jan", "Feb", "Mar", etc.
      </p>

      <h4>Quarterly Credits</h4>
      <p>
        Shows 4 columns: Q1 (Jan-Mar), Q2 (Apr-Jun), Q3 (Jul-Sep), Q4 (Oct-Dec).
      </p>

      <h4>Semi-Annual Credits</h4>
      <p>
        Shows 2 columns: H1 (Jan-Jun), H2 (Jul-Dec).
      </p>

      <h4>Annual Credits (Calendar)</h4>
      <p>
        Shows 1 column for the entire year.
      </p>

      <h4>Anniversary-Based Credits</h4>
      <p>
        Credits that reset on your card anniversary show date ranges instead of calendar periods.
        For example: "Mar 14, 2024 - Mar 13, 2025"
      </p>
      <p>
        These credits span across calendar years, so they may appear differently than
        calendar-based credits.
      </p>

      <h3>Expanding Cards</h3>
      <p>
        Click the accordion arrow next to a card name to expand or collapse its credits.
        This helps you focus on specific cards without scrolling through everything.
      </p>

      <h3>Filtering Options</h3>
      <ul>
        <li><strong>By Year:</strong> Use the year selector to view different years</li>
        <li><strong>By Card:</strong> Expand only the cards you want to see</li>
        <li><strong>By Frequency:</strong> Some views allow filtering by monthly, quarterly, etc.</li>
      </ul>

      <div className="callout callout--tip">
        <strong>Tip:</strong> Review your credit history quarterly to spot patterns.
        If you consistently miss the same credit, consider whether it's worth tracking
        or if you should adjust your habits to use it.
      </div>
    </div>
  );
};

export default CreditsHistory;
