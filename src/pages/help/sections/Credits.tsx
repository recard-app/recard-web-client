import React from 'react';
import { Link } from 'react-router-dom';
import { PAGES } from '../../../types/Pages';
import { HelpSection } from '../components';

const Credits: React.FC = () => {
  return (
    <div className="help-content">
      <h2>Understanding Credits</h2>
      <p>
        Credits are fixed benefits you can redeem from your credit cards. Unlike points (which you earn),
        credits are "use it or lose it."
      </p>

      <HelpSection title="What's a Credit?" defaultExpanded={true}>
        <p>
          A credit is a benefit from your credit card that offsets purchases in specific categories.
          When you make an eligible purchase, the credit automatically applies as a statement credit.
        </p>

        <h4>Examples</h4>
        <table>
          <thead>
            <tr>
              <th>Card</th>
              <th>Credit</th>
              <th>Value</th>
              <th>Frequency</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Amex Gold</td>
              <td>Dining Credit</td>
              <td>$10</td>
              <td>Monthly</td>
            </tr>
            <tr>
              <td>Amex Platinum</td>
              <td>Uber Credit</td>
              <td>$15</td>
              <td>Monthly</td>
            </tr>
            <tr>
              <td>Chase Sapphire Reserve</td>
              <td>Travel Credit</td>
              <td>$300</td>
              <td>Annual</td>
            </tr>
          </tbody>
        </table>
      </HelpSection>

      <HelpSection title="Why Track Credits?" defaultExpanded={true}>
        <p>
          The average premium cardholder leaves <strong>$200+ in credits unused each year</strong>.
          Tracking helps you:
        </p>
        <ul>
          <li>Remember what credits you have available</li>
          <li>Use credits before they expire</li>
          <li>See if your annual fee is worth it</li>
          <li>Maximize the value of your cards</li>
        </ul>

        <div className="callout callout--tip">
          <strong>Quick math:</strong> If you have 3 premium cards with $50/month in combined credits,
          that's $600/year. Miss just 2 months? That's $100 left on the table.
        </div>
      </HelpSection>

      <HelpSection title="Credit Status Colors" defaultExpanded={true}>
        <table>
          <thead>
            <tr>
              <th>Color</th>
              <th>Status</th>
              <th>Meaning</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="status-indicator status-indicator--green">Green</span></td>
              <td>Used</td>
              <td>Fully redeemed</td>
              <td>Nice work!</td>
            </tr>
            <tr>
              <td><span className="status-indicator status-indicator--yellow">Yellow</span></td>
              <td>Partial</td>
              <td>Partially used</td>
              <td>Use the rest</td>
            </tr>
            <tr>
              <td><span className="status-indicator status-indicator--blue">Blue</span></td>
              <td>Available</td>
              <td>Ready to use</td>
              <td>Use it!</td>
            </tr>
            <tr>
              <td><span className="status-indicator status-indicator--gray">Gray</span></td>
              <td>Inactive</td>
              <td>Not tracking</td>
              <td>Enable if needed</td>
            </tr>
          </tbody>
        </table>
      </HelpSection>

      <HelpSection title="Period Boundaries & Timing" defaultExpanded={true}>
        <p>
          Credits reset at midnight <strong>Eastern Time</strong>. This applies to all period types:
        </p>
        <ul>
          <li><strong>Monthly:</strong> Resets at 12:00 AM ET on the 1st of each month</li>
          <li><strong>Quarterly:</strong> Resets at 12:00 AM ET on Jan 1, Apr 1, Jul 1, Oct 1</li>
          <li><strong>Semi-Annual:</strong> Resets at 12:00 AM ET on Jan 1, Jul 1</li>
          <li><strong>Annual:</strong> Resets at 12:00 AM ET on Jan 1 (or your anniversary)</li>
        </ul>

        <div className="callout callout--info">
          <strong>Timezone note:</strong> If you're not in Eastern Time, remember that period
          boundaries are based on ET. A "monthly" credit ending on January 31st actually ends
          at midnight ET, which may be late evening on the 30th in Pacific Time.
        </div>
      </HelpSection>

      <HelpSection title="Managing Credits" defaultExpanded={true}>
        <p>
          Track your credits in <Link to={PAGES.MY_CREDITS.PATH} className="nav-path">My Credits</Link>.
        </p>

        <h4>How to Update Credit Status</h4>
        <ol>
          <li>Find the credit in My Credits</li>
          <li>Click on the credit</li>
          <li>Select status:
            <ul>
              <li><strong>Used</strong> - Fully redeemed</li>
              <li><strong>Partial</strong> - Enter amount used</li>
              <li><strong>Not Used</strong> - Reset to available</li>
            </ul>
          </li>
          <li>Save</li>
        </ol>

        <h4>When to Update</h4>
        <ul>
          <li>After you use a credit (dining, Uber, etc.)</li>
          <li>At month end for automatic credits</li>
          <li>When reviewing your benefits</li>
        </ul>
      </HelpSection>
    </div>
  );
};

export default Credits;
