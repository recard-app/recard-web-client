import React from 'react';
import { CONTACT_EMAIL } from '../../../types';

const CardsDetails: React.FC = () => {
  return (
    <div className="help-content">
      <h2>Card Details</h2>
      <p>
        View comprehensive information about each of your credit cards.
      </p>

      <h3>Card Information Tabs</h3>
      <p>Each card detail page shows three tabs of information:</p>

      <h4>Multipliers Tab</h4>
      <p>Shows earning rates by spending category:</p>
      <ul>
        <li><strong>Category</strong> - The type of purchase (dining, travel, groceries, etc.)</li>
        <li><strong>Rate</strong> - Points/cashback per dollar (e.g., 3x, 2%, 5 points)</li>
        <li><strong>Notes</strong> - Any special conditions or caps</li>
      </ul>
      <p>Examples:</p>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Rate</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Dining</td>
            <td>4x points</td>
            <td>Worldwide dining</td>
          </tr>
          <tr>
            <td>Travel</td>
            <td>3x points</td>
            <td>Booked directly or through portal</td>
          </tr>
          <tr>
            <td>Everything Else</td>
            <td>1x points</td>
            <td>-</td>
          </tr>
        </tbody>
      </table>

      <h4>Credits Tab</h4>
      <p>Shows redeemable benefits from your card:</p>
      <ul>
        <li><strong>Credit Name</strong> - What the credit is for (dining, streaming, etc.)</li>
        <li><strong>Value</strong> - Dollar amount ($10, $15, $200, etc.)</li>
        <li><strong>Frequency</strong> - How often it resets (monthly, quarterly, annually)</li>
        <li><strong>Status</strong> - Used, partial, available, or inactive</li>
      </ul>
      <p>Examples:</p>
      <table>
        <thead>
          <tr>
            <th>Credit</th>
            <th>Value</th>
            <th>Frequency</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Dining Credit</td>
            <td>$10</td>
            <td>Monthly</td>
          </tr>
          <tr>
            <td>Uber Credit</td>
            <td>$15</td>
            <td>Monthly</td>
          </tr>
          <tr>
            <td>Travel Credit</td>
            <td>$300</td>
            <td>Annual</td>
          </tr>
        </tbody>
      </table>

      <h4>Perks Tab</h4>
      <p>Shows non-credit benefits:</p>
      <ul>
        <li><strong>Lounge Access</strong> - Priority Pass, Centurion, etc.</li>
        <li><strong>Insurance</strong> - Trip delay, rental car, purchase protection</li>
        <li><strong>Status</strong> - Hotel/airline elite status</li>
        <li><strong>Other Benefits</strong> - Global Entry credit, TSA PreCheck, etc.</li>
      </ul>

      <h3>Understanding Your Cards</h3>
      <p>Use this information to:</p>
      <ul>
        <li>Know which card earns the most for each category</li>
        <li>Track credits you should be using</li>
        <li>Understand the full value of your annual fee</li>
        <li>Decide which cards to keep or cancel</li>
      </ul>

      <div className="callout callout--info">
        <strong>See something wrong?</strong> Card benefits change over time. If you notice
        incorrect information, please email us at {CONTACT_EMAIL} so we can update our database. We're working
        on an in-app feedback system to make this easier.
      </div>
    </div>
  );
};

export default CardsDetails;
