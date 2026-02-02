import React from 'react';
import { Link } from 'react-router-dom';
import { PAGES } from '../../../types/Pages';
import { HelpSection } from '../components';

const PreferencesHelp: React.FC = () => {
  return (
    <div className="help-content">
      <h2>Preferences</h2>
      <p>
        Customize how the app works for you in{' '}
        <Link to={PAGES.PREFERENCES.PATH} className="nav-path">Preferences</Link>.
      </p>

      <HelpSection title="Custom AI Instructions" defaultExpanded={true}>
        <p>
          Custom instructions let you personalize how the AI makes recommendations.
          These instructions are included in every conversation with the AI.
        </p>

        <h4>What Custom Instructions Do</h4>
        <ul>
          <li>Tell the AI your priorities (cashback vs points, specific airlines, etc.)</li>
          <li>Share context about your spending habits</li>
          <li>Set preferences for how recommendations are presented</li>
        </ul>

        <h4>Examples of Effective Instructions</h4>
        <table>
          <thead>
            <tr>
              <th>Goal</th>
              <th>Example Instruction</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Prioritize cashback</td>
              <td>"I prefer cashback over points because I value simplicity"</td>
            </tr>
            <tr>
              <td>Focus on travel</td>
              <td>"I fly United frequently and value United miles highly"</td>
            </tr>
            <tr>
              <td>Avoid specific cards</td>
              <td>"Don't recommend my Amex for small purchases under $50"</td>
            </tr>
            <tr>
              <td>Spending context</td>
              <td>"I shop at Costco weekly and travel internationally twice a year"</td>
            </tr>
          </tbody>
        </table>

        <h4>How to Set Custom Instructions</h4>
        <ol>
          <li>Go to <Link to={PAGES.PREFERENCES.PATH} className="nav-path">Preferences</Link></li>
          <li>Find the <strong>Custom Instructions</strong> section</li>
          <li>Enter your instructions in the text field</li>
          <li>Click <strong>Save</strong></li>
        </ol>

        <div className="callout callout--tip">
          <strong>Tip:</strong> Be specific about your goals. Instead of "I like travel,"
          try "I'm saving for a trip to Japan and prefer transferable points."
        </div>
      </HelpSection>

      <HelpSection title="Chat History Settings" defaultExpanded={true}>
        <p>Control whether your conversations with the AI are saved.</p>

        <h4>Track Chat History</h4>
        <table>
          <thead>
            <tr>
              <th>Setting</th>
              <th>What Happens</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Enabled</strong></td>
              <td>Conversations are saved and accessible in Previous Chats</td>
            </tr>
            <tr>
              <td><strong>Disabled</strong></td>
              <td>New conversations are not saved after you leave the page</td>
            </tr>
          </tbody>
        </table>

        <div className="callout callout--info">
          <strong>Note:</strong> This setting only affects new conversations. Existing
          chat history remains until you delete it from Account settings.
        </div>
      </HelpSection>

      <HelpSection title="How Preferences Affect Recommendations" defaultExpanded={true}>
        <p>Your preferences directly influence how the AI responds:</p>

        <h4>Custom Instructions</h4>
        <ul>
          <li>The AI reads your custom instructions before answering</li>
          <li>Recommendations are tailored to your stated priorities</li>
          <li>Context you provide helps the AI understand your situation</li>
        </ul>

        <h4>Example Impact</h4>
        <p>
          <strong>Without custom instructions:</strong> "Use your Chase Sapphire Preferred
          for 3x points on dining."
        </p>
        <p>
          <strong>With "I value cashback over points":</strong> "Use your Citi Double Cash
          for 2% back. While your Sapphire earns 3x points, cashback aligns with your
          preference for simplicity."
        </p>

        <div className="callout callout--tip">
          <strong>Keep it updated:</strong> As your goals change (new trip planned,
          different spending patterns), update your custom instructions to get the most
          relevant recommendations.
        </div>
      </HelpSection>
    </div>
  );
};

export default PreferencesHelp;
