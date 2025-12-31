import React from 'react';
import { Link } from 'react-router-dom';
import { PAGES } from '../../../types/Pages';

const AskAITips: React.FC = () => {
  return (
    <div className="help-content">
      <h2>Tips for Better Answers</h2>
      <p>
        Get more accurate and useful recommendations by following these tips.
      </p>

      <h3>1. Be Specific About the Merchant</h3>
      <p>The more specific you are, the better the recommendation.</p>
      <table>
        <thead>
          <tr>
            <th>Instead of...</th>
            <th>Try...</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>"Best card for gas"</td>
            <td>"Best card for gas at Costco"</td>
          </tr>
          <tr>
            <td>"Best card for groceries"</td>
            <td>"Best card for groceries at Whole Foods"</td>
          </tr>
          <tr>
            <td>"Best card for shopping"</td>
            <td>"Best card for electronics at Best Buy"</td>
          </tr>
        </tbody>
      </table>

      <h3>2. Include the Amount</h3>
      <p>
        Amount matters for bonus thresholds, category caps, and determining if credits apply.
      </p>
      <ul>
        <li>"Best card for a $50 dinner" vs "Best card for a $500 celebration dinner"</li>
        <li>"I need to spend $4,000 this quarter to hit my bonus"</li>
        <li>"$15 Uber ride" might trigger a credit, "$50 might not"</li>
      </ul>

      <h3>3. State Your Constraints</h3>
      <p>Tell the AI about your preferences or limitations:</p>
      <ul>
        <li>"...but I prefer cashback over points"</li>
        <li>"...and I don't want to use my annual fee cards"</li>
        <li>"...keeping in mind I'm trying to use up my Amex credits"</li>
        <li>"...I want to keep my cards under utilization limit"</li>
      </ul>

      <h3>4. Set Custom Instructions</h3>
      <p>
        Save time by setting preferences in <Link to={PAGES.PREFERENCES.PATH} className="nav-path">Preferences</Link>.
        The AI will remember things like:
      </p>
      <ul>
        <li>Your preferred rewards type (cashback vs points)</li>
        <li>Travel goals (airlines, hotels, destinations)</li>
        <li>Cards you want to prioritize or avoid</li>
        <li>Spending patterns and categories</li>
      </ul>

      <h3>5. Ask Follow-up Questions</h3>
      <p>
        The conversation continues, so you can ask for more details:
      </p>
      <ul>
        <li>"Why did you recommend that card?"</li>
        <li>"What if I used my other card instead?"</li>
        <li>"Are there any credits I should use first?"</li>
        <li>"What about the points I'd earn?"</li>
      </ul>

      <div className="callout callout--info">
        <strong>Remember:</strong> The AI only knows about your cards and their benefits.
        It doesn't see your transactions or account balances.
      </div>
    </div>
  );
};

export default AskAITips;
