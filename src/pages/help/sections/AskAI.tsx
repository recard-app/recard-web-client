import React from 'react';
import { Link } from 'react-router-dom';
import { HelpSection } from '../components';

const AskAI: React.FC = () => {
  return (
    <div className="help-content">
      <h2>Ask the AI</h2>
      <p>
        The AI assistant helps you make the most of your credit cards by providing personalized
        recommendations based on your cards and preferences.
      </p>

      <HelpSection title="What You Can Ask" defaultExpanded={true}>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Examples</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Best card for...</strong></td>
              <td>"Best card for Amazon?", "What should I use for gas?"</td>
            </tr>
            <tr>
              <td><strong>Compare cards</strong></td>
              <td>"Compare Sapphire vs Gold for travel"</td>
            </tr>
            <tr>
              <td><strong>Strategy advice</strong></td>
              <td>"Should I keep my Platinum card?", "How do I maximize points?"</td>
            </tr>
            <tr>
              <td><strong>Card research</strong></td>
              <td>"What cards would complement my setup?"</td>
            </tr>
          </tbody>
        </table>
      </HelpSection>

      <HelpSection title="Example Prompts" defaultExpanded={true}>
        <h4>Everyday Spending</h4>
        <ul>
          <li>"What card should I use for groceries at Costco?"</li>
          <li>"Best card for my $50 Netflix subscription?"</li>
          <li>"Which card for a $200 restaurant dinner?"</li>
        </ul>

        <h4>Travel</h4>
        <ul>
          <li>"What's my best card for booking flights?"</li>
          <li>"Should I use my Sapphire or Venture for hotels?"</li>
          <li>"Best card for international purchases?"</li>
        </ul>

        <h4>Strategy</h4>
        <ul>
          <li>"Is the Amex Gold worth $250/year for me?"</li>
          <li>"What card am I missing in my wallet?"</li>
          <li>"How should I split a $500 purchase for maximum points?"</li>
        </ul>
      </HelpSection>

      <HelpSection title="Tips for Better Answers" defaultExpanded={true}>
        <ol>
          <li>
            <strong>Be specific about the merchant</strong>
            <ul>
              <li>Good: "Best card for Costco gas"</li>
              <li>Okay: "Best card for gas"</li>
            </ul>
          </li>
          <li>
            <strong>Mention the amount</strong> (for bonus thresholds)
            <p>"Best way to spend $4,000 this quarter"</p>
          </li>
          <li>
            <strong>Include constraints</strong>
            <ul>
              <li>"...but I don't want to pay an annual fee"</li>
              <li>"...preferring cashback over points"</li>
            </ul>
          </li>
          <li>
            <strong>Set your preferences</strong>
            <p>The AI remembers your custom instructions from Preferences.</p>
          </li>
        </ol>
      </HelpSection>

      <HelpSection title="Understanding Recommendations" defaultExpanded={true}>
        <p><strong>The AI considers:</strong></p>
        <ul>
          <li><strong>Multipliers</strong> - Which card earns most for this purchase</li>
          <li><strong>Credits</strong> - Can you use a credit instead of paying?</li>
          <li><strong>Bonuses</strong> - Are you working toward a spending threshold?</li>
          <li><strong>Your preferences</strong> - What you've told it matters to you</li>
        </ul>

        <div className="callout callout--info">
          <strong>Why might a recommendation surprise you?</strong>
          <ul>
            <li>A lower multiplier card might have a relevant credit</li>
            <li>A no-fee card might beat a premium card for small purchases</li>
            <li>Rotating categories change quarterly</li>
          </ul>
        </div>
      </HelpSection>

      <HelpSection title="What the AI Can Do For You" defaultExpanded={true}>
        <p>The AI isn't just for recommendations. It can take actions on your behalf:</p>
        <table>
          <thead>
            <tr>
              <th>Action</th>
              <th>How to Ask</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Add cards to your wallet</strong></td>
              <td>"Add the Chase Sapphire Preferred to my cards"</td>
            </tr>
            <tr>
              <td><strong>Update credit status</strong></td>
              <td>"Mark my Amex dining credit as used"</td>
            </tr>
            <tr>
              <td><strong>Set card preferences</strong></td>
              <td>"Set my Gold card as preferred for dining"</td>
            </tr>
            <tr>
              <td><strong>Freeze/unfreeze cards</strong></td>
              <td>"Freeze my Capital One card"</td>
            </tr>
          </tbody>
        </table>
        <p>Just ask naturally, and the AI will handle the action for you.</p>
      </HelpSection>

      <HelpSection title="Daily Digest" defaultExpanded={true}>
        <p>
          Each day when you start a new chat, you'll see a Daily Digest. This AI-generated
          summary shows you:
        </p>
        <ul>
          <li>Credits expiring soon</li>
          <li>Quick wins you can act on today</li>
          <li>Your monthly progress</li>
        </ul>
        <p>
          Learn more about the Daily Digest in the{' '}
          <Link to="/help/daily-digest" className="nav-path">Daily Digest</Link> help section.
        </p>
      </HelpSection>
    </div>
  );
};

export default AskAI;
