import React from 'react';

const ReferenceColors: React.FC = () => {
  return (
    <div className="help-content">
      <h2>Status Colors & Icons</h2>
      <p>
        Quick reference for the colors and icons used throughout the app.
      </p>

      <h3>Credit Status</h3>
      <table>
        <thead>
          <tr>
            <th>Visual</th>
            <th>Name</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span className="status-indicator status-indicator--used"></span></td>
            <td>Redeemed</td>
            <td>Fully used this period</td>
          </tr>
          <tr>
            <td><span className="status-indicator status-indicator--partially-used"></span></td>
            <td>Partially Used</td>
            <td>Some value remaining to use</td>
          </tr>
          <tr>
            <td><span className="status-indicator status-indicator--not-used"></span></td>
            <td>Not Used</td>
            <td>Available to redeem</td>
          </tr>
          <tr>
            <td><span className="status-indicator status-indicator--inactive"></span></td>
            <td>Inactive</td>
            <td>Not being tracked</td>
          </tr>
          <tr>
            <td><span className="status-indicator status-indicator--disabled"></span></td>
            <td>Disabled</td>
            <td>Credit not available (outside effective dates)</td>
          </tr>
        </tbody>
      </table>

      <h3>Card States</h3>
      <table>
        <thead>
          <tr>
            <th>State</th>
            <th>Icon</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Active</td>
            <td>-</td>
            <td>Normal card, included in recommendations</td>
          </tr>
          <tr>
            <td>Preferred</td>
            <td>Star</td>
            <td>Your go-to for a specific category</td>
          </tr>
          <tr>
            <td>Frozen</td>
            <td>Snowflake</td>
            <td>Temporarily excluded from recommendations</td>
          </tr>
        </tbody>
      </table>

      <h3>Period Indicators (Credit History)</h3>
      <table>
        <thead>
          <tr>
            <th>Visual</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span className="status-indicator status-indicator--used"></span></td>
            <td>Period complete - credit fully used</td>
          </tr>
          <tr>
            <td><span className="status-indicator status-indicator--partially-used"></span></td>
            <td>Period complete - credit partially used</td>
          </tr>
          <tr>
            <td><span className="status-indicator status-indicator--not-used"></span></td>
            <td>Period complete - credit not used</td>
          </tr>
          <tr>
            <td><span className="status-indicator status-indicator--future"></span></td>
            <td>Future period - not yet available</td>
          </tr>
          <tr>
            <td><span className="status-indicator status-indicator--disabled"></span></td>
            <td>Credit not active during this period</td>
          </tr>
        </tbody>
      </table>

      <h3>Alert Colors</h3>
      <table>
        <thead>
          <tr>
            <th>Color</th>
            <th>Type</th>
            <th>Used For</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ color: '#22CC9D' }}>Green</td>
            <td>Success</td>
            <td>Successful actions, confirmations</td>
          </tr>
          <tr>
            <td style={{ color: '#2563EB' }}>Blue</td>
            <td>Info</td>
            <td>Informational messages, tips</td>
          </tr>
          <tr>
            <td style={{ color: '#F59E0B' }}>Orange</td>
            <td>Warning</td>
            <td>Cautions, expiring credits</td>
          </tr>
          <tr>
            <td style={{ color: '#EF4444' }}>Red</td>
            <td>Error</td>
            <td>Errors, destructive actions</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ReferenceColors;
