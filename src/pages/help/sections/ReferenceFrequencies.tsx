import React from 'react';

const ReferenceFrequencies: React.FC = () => {
  return (
    <div className="help-content">
      <h2>Earning Frequencies</h2>
      <p>
        Credits reset at different intervals depending on the card and benefit.
      </p>

      <h3>Frequency Types</h3>
      <table>
        <thead>
          <tr>
            <th>Frequency</th>
            <th>Reset Schedule</th>
            <th>Example Credits</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Monthly</strong></td>
            <td>1st of each month</td>
            <td>$10 dining credit, $15 Uber credit</td>
          </tr>
          <tr>
            <td><strong>Quarterly</strong></td>
            <td>Jan 1, Apr 1, Jul 1, Oct 1</td>
            <td>$25 streaming credit, rotating category bonus</td>
          </tr>
          <tr>
            <td><strong>Semi-Annual</strong></td>
            <td>Jan 1, Jul 1</td>
            <td>$50 hotel credit</td>
          </tr>
          <tr>
            <td><strong>Annual (Calendar)</strong></td>
            <td>January 1</td>
            <td>$300 travel credit (calendar year)</td>
          </tr>
          <tr>
            <td><strong>Annual (Anniversary)</strong></td>
            <td>Your card open date</td>
            <td>$200 airline credit, statement credits</td>
          </tr>
        </tbody>
      </table>

      <h3>Calendar Year vs Anniversary</h3>

      <h4>Calendar Year</h4>
      <p>
        These credits follow the calendar year and reset on January 1 for everyone.
      </p>
      <ul>
        <li>Simple to track - same dates for everyone</li>
        <li>Use by December 31 or lose the value</li>
        <li>Often travel credits, dining credits</li>
      </ul>

      <h4>Anniversary-Based</h4>
      <p>
        These credits reset on the anniversary of when you opened your card account.
      </p>
      <ul>
        <li>Personal to your account opening date</li>
        <li>Often coincides with your annual fee posting</li>
        <li>More common with airline-specific credits</li>
      </ul>

      <div className="callout callout--info">
        <strong>Example:</strong> If you opened your card on March 15, 2022, your anniversary
        credit period runs from March 15, 2024 to March 14, 2025.
      </div>

      <h3>Tracking Tips by Frequency</h3>

      <h4>Monthly Credits</h4>
      <ul>
        <li>Set a reminder at the start of each month</li>
        <li>Check near month-end to catch unused credits</li>
        <li>These are usually the easiest to use regularly</li>
      </ul>

      <h4>Quarterly Credits</h4>
      <ul>
        <li>Mark quarter-start dates in your calendar</li>
        <li>Review mid-quarter to ensure you're on track</li>
        <li>Often tied to rotating bonus categories</li>
      </ul>

      <h4>Annual Credits</h4>
      <ul>
        <li>Plan larger purchases around these credits</li>
        <li>Don't wait until December to use calendar-year credits</li>
        <li>For anniversary credits, know your exact date</li>
      </ul>

      <h3>Common Credit Examples by Frequency</h3>
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
            <td>$15 ($35 Dec)</td>
            <td>Monthly</td>
          </tr>
          <tr>
            <td>Chase Sapphire Reserve</td>
            <td>Travel Credit</td>
            <td>$300</td>
            <td>Annual (Anniversary)</td>
          </tr>
          <tr>
            <td>Amex Platinum</td>
            <td>Airline Fee Credit</td>
            <td>$200</td>
            <td>Annual (Calendar)</td>
          </tr>
          <tr>
            <td>Capital One Venture X</td>
            <td>Travel Credit</td>
            <td>$300</td>
            <td>Annual (Anniversary)</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ReferenceFrequencies;
