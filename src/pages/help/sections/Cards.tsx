import React from 'react';
import { Link } from 'react-router-dom';
import { PAGES } from '../../../types/Pages';
import { SUPPORT_EMAIL } from '../../../types';
import { HelpSection } from '../components';

const Cards: React.FC = () => {
  return (
    <div className="help-content">
      <h2>Your Cards</h2>
      <p>
        Manage your credit card portfolio in <Link to={PAGES.MY_CARDS.PATH} className="nav-path">Manage Cards</Link> (accessible from the account menu).
        Add cards, customize settings, and view card details.
      </p>

      <HelpSection title="Adding Cards" defaultExpanded={true}>
        <ol>
          <li>Open <Link to={PAGES.MY_CARDS.PATH} className="nav-path">Manage Cards</Link> from the account menu</li>
          <li>Click <strong>Add Card</strong></li>
          <li>Search by card name or bank</li>
          <li>Select the correct card from results</li>
          <li>Benefits load automatically</li>
        </ol>

        <h4>Common Questions</h4>
        <ul>
          <li>
            <strong>Card not found?</strong> Email us at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> to add it to our database. We're building
            a card request feature to make this easier in the future.
          </li>
          <li>
            <strong>Wrong benefits showing?</strong> Email us at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> so we can fix it. We're working
            on an in-app feedback system.
          </li>
          <li>
            <strong>Have the same card twice?</strong> Only add it once - benefits are the same.
          </li>
        </ul>
      </HelpSection>

      <HelpSection title="Card Settings" defaultExpanded={true}>
        <h4>Preferred Cards</h4>
        <p>Mark a card as your go-to for specific categories.</p>
        <ul>
          <li><strong>When to use:</strong> You always want to use a specific card for dining, travel, etc.</li>
          <li><strong>How:</strong> Card details → Set as Preferred</li>
        </ul>

        <h4>Freezing Cards</h4>
        <p>Temporarily exclude a card from AI recommendations.</p>
        <ul>
          <li><strong>When to use:</strong></li>
          <ul>
            <li>Card is in a drawer, not being used</li>
            <li>Considering whether to cancel</li>
            <li>Taking a break from a card</li>
          </ul>
          <li><strong>How:</strong> Card details → Freeze Card</li>
        </ul>
        <p>The card stays in your portfolio but won't appear in recommendations.</p>

        <h4>Anniversary Dates</h4>
        <p>The date you opened your card account.</p>
        <ul>
          <li><strong>Why it matters:</strong></li>
          <ul>
            <li>Some credits reset on your anniversary, not January 1</li>
            <li>Annual fee posts on this date</li>
            <li>Helps track card age</li>
          </ul>
          <li><strong>How:</strong> Card details → Set Anniversary Date</li>
        </ul>
      </HelpSection>

      <HelpSection title="Viewing Card Details" defaultExpanded={true}>
        <p>Each card shows three tabs:</p>
        <table>
          <thead>
            <tr>
              <th>Tab</th>
              <th>What's Inside</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Multipliers</strong></td>
              <td>Earning rates by category (3x dining, 2x travel, etc.)</td>
            </tr>
            <tr>
              <td><strong>Credits</strong></td>
              <td>Monthly/annual benefits ($10 dining credit, etc.)</td>
            </tr>
            <tr>
              <td><strong>Perks</strong></td>
              <td>Other benefits (lounge access, insurance, etc.)</td>
            </tr>
          </tbody>
        </table>
      </HelpSection>
    </div>
  );
};

export default Cards;
