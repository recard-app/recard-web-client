import React from 'react';
import { Link } from 'react-router-dom';
import { PAGES } from '../../../types/Pages';

const CreditsDashboard: React.FC = () => {
  return (
    <div className="help-content">
      <h2>Credits Dashboard</h2>
      <p>
        The <Link to={PAGES.MY_CREDITS.PATH} className="nav-path">My Credits</Link> page gives you
        a complete view of your credit card benefits.
      </p>

      <h3>Monthly Stats</h3>
      <p>At the top of the page, you'll see your monthly statistics:</p>
      <table>
        <thead>
          <tr>
            <th>Stat</th>
            <th>What It Shows</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Used Value</strong></td>
            <td>Total dollar value of credits you've redeemed this month</td>
          </tr>
          <tr>
            <td><strong>Possible Value</strong></td>
            <td>Total potential value available this month</td>
          </tr>
          <tr>
            <td><strong>Credits Count</strong></td>
            <td>Number of credits: used / partial / unused</td>
          </tr>
        </tbody>
      </table>

      <h3>Credit List</h3>
      <p>Credits are organized by earning frequency:</p>
      <ul>
        <li><strong>Monthly</strong> - Reset on the 1st of each month</li>
        <li><strong>Quarterly</strong> - Reset Jan 1, Apr 1, Jul 1, Oct 1</li>
        <li><strong>Semi-Annual</strong> - Reset Jan 1, Jul 1</li>
        <li><strong>Annual (Calendar)</strong> - Reset January 1</li>
        <li><strong>Annual (Anniversary)</strong> - Reset on your card open date</li>
      </ul>

      <h3>Status Colors</h3>
      <table>
        <thead>
          <tr>
            <th>Color</th>
            <th>Meaning</th>
            <th>What to Do</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span className="status-indicator status-indicator--green">Green</span></td>
            <td>Fully used</td>
            <td>You're good!</td>
          </tr>
          <tr>
            <td><span className="status-indicator status-indicator--yellow">Yellow</span></td>
            <td>Partially used</td>
            <td>Consider using the remainder</td>
          </tr>
          <tr>
            <td><span className="status-indicator status-indicator--blue">Blue</span></td>
            <td>Available</td>
            <td>Ready to use - don't let it expire</td>
          </tr>
          <tr>
            <td><span className="status-indicator status-indicator--gray">Gray</span></td>
            <td>Not tracked</td>
            <td>Enable tracking if you want to use it</td>
          </tr>
        </tbody>
      </table>

      <h3>Quick Actions</h3>
      <p>From the dashboard, you can:</p>
      <ul>
        <li><strong>Update status</strong> - Click on any credit to mark it as used, partial, or reset</li>
        <li><strong>View history</strong> - See past usage patterns</li>
        <li><strong>Filter by card</strong> - Focus on a specific card's credits</li>
        <li><strong>Filter by frequency</strong> - See only monthly, quarterly, etc.</li>
      </ul>

      <div className="callout callout--tip">
        <strong>Pro tip:</strong> Check your credits at the beginning of each month to see
        what's available, and again near the end to make sure you've used everything.
      </div>
    </div>
  );
};

export default CreditsDashboard;
