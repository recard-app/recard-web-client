import React from 'react';

const CreditsUpdating: React.FC = () => {
  return (
    <div className="help-content">
      <h2>Updating Your Credits</h2>
      <p>
        Keep your credit tracking up to date to get an accurate picture of your benefits.
      </p>

      <h3>How to Mark a Credit as Used</h3>
      <ol>
        <li>Go to <strong>My Credits</strong></li>
        <li>Find the credit you want to update</li>
        <li>Click on the credit row</li>
        <li>Choose the appropriate status:
          <ul>
            <li><strong>Used</strong> - You've fully redeemed the credit</li>
            <li><strong>Partial</strong> - You've used some but not all (enter the amount)</li>
            <li><strong>Not Used</strong> - Reset to available status</li>
          </ul>
        </li>
        <li>Click Save</li>
      </ol>

      <h3>When to Update</h3>
      <table>
        <thead>
          <tr>
            <th>Situation</th>
            <th>When to Update</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Used a dining credit at a restaurant</td>
            <td>After the meal</td>
          </tr>
          <tr>
            <td>Uber/Lyft credit for a ride</td>
            <td>After the ride</td>
          </tr>
          <tr>
            <td>Streaming credits (auto-apply)</td>
            <td>After you see the statement credit</td>
          </tr>
          <tr>
            <td>Travel credit for a booking</td>
            <td>After booking or when credit posts</td>
          </tr>
          <tr>
            <td>Monthly review</td>
            <td>Last few days of the month</td>
          </tr>
        </tbody>
      </table>

      <h3>Partial Credits</h3>
      <p>
        Some credits can be used partially. For example, a $15 Uber credit might be used
        $8 for one ride, leaving $7 for later in the month.
      </p>
      <p>When marking a credit as partial:</p>
      <ol>
        <li>Click on the credit</li>
        <li>Select "Partial"</li>
        <li>Enter the amount you've used so far</li>
        <li>The remaining amount will be calculated automatically</li>
      </ol>

      <h3>Automatic Resets</h3>
      <p>
        Credits automatically reset based on their frequency:
      </p>
      <ul>
        <li><strong>Monthly:</strong> Resets on the 1st of each month</li>
        <li><strong>Quarterly:</strong> Resets on Jan 1, Apr 1, Jul 1, Oct 1</li>
        <li><strong>Semi-Annual:</strong> Resets on Jan 1 and Jul 1</li>
        <li><strong>Annual (Calendar):</strong> Resets on January 1</li>
        <li><strong>Annual (Anniversary):</strong> Resets on your card anniversary date</li>
      </ul>

      <div className="callout callout--info">
        <strong>Note:</strong> When a credit resets, it returns to "Available" status.
        Your usage from the previous period is saved in your credit history.
      </div>

      <h3>Inactive Credits</h3>
      <p>
        If you don't want to track a specific credit (maybe you never use it), you can
        set it to inactive. Inactive credits:
      </p>
      <ul>
        <li>Won't appear in your monthly stats</li>
        <li>Won't count toward "unused" credits</li>
        <li>Can be reactivated at any time</li>
      </ul>
    </div>
  );
};

export default CreditsUpdating;
