import React from 'react';
import { Link } from 'react-router-dom';
import { PAGES } from '../../../types/Pages';
import { APP_NAME } from '../../../types';

const GettingStarted: React.FC = () => {
  return (
    <div className="help-content">
      <h2>Getting Started</h2>

      <h3>What is {APP_NAME}?</h3>
      <p>
        {APP_NAME} helps you get more from your credit cards. Add your cards, ask our AI which one to use,
        and track your credits so you never miss a benefit.
      </p>

      <p><strong>Three things you can do:</strong></p>
      <ul>
        <li>Get AI recommendations for which card to use</li>
        <li>Track credits and benefits across all your cards</li>
        <li>See your complete rewards picture in one place</li>
      </ul>

      <h3>5-Minute Setup Guide</h3>
      <ol>
        <li>
          <strong>Sign in</strong> (30 seconds)
          <p>Use Google or email to create your account.</p>
        </li>
        <li>
          <strong>Add your main card</strong> (2 minutes)
          <p>
            Go to <Link to={PAGES.MY_CARDS.PATH} className="nav-path">My Cards</Link> and
            click Add Card. Search by name or issuer. Benefits load automatically.
          </p>
        </li>
        <li>
          <strong>Ask a question</strong> (1 minute)
          <p>Try: "What's my best card for dining?"</p>
        </li>
        <li>
          <strong>Check your credits</strong> (1 minute)
          <p>
            Go to <Link to={PAGES.MY_CREDITS.PATH} className="nav-path">My Credits</Link> to
            see what benefits you can use this month.
          </p>
        </li>
      </ol>

      <div className="callout callout--tip">
        <strong>You're ready!</strong> Add more cards when you have time.
      </div>

      <h3>Your First Recommendation</h3>
      <p>Try asking:</p>
      <ul>
        <li>"What card should I use for groceries?"</li>
        <li>"Which of my cards has the best travel benefits?"</li>
        <li>"Best card for Amazon purchases?"</li>
      </ul>

      <p><strong>What you'll see:</strong></p>
      <ul>
        <li>The recommended card and why</li>
        <li>Alternative options if applicable</li>
        <li>Tips to maximize rewards</li>
      </ul>

      <h3>Quick Links</h3>
      <table>
        <thead>
          <tr>
            <th>I want to...</th>
            <th>Go to</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Ask for a card recommendation</td>
            <td><Link to={PAGES.HOME.PATH} className="nav-path">Home</Link></td>
          </tr>
          <tr>
            <td>Add or manage my cards</td>
            <td><Link to={PAGES.MY_CARDS.PATH} className="nav-path">My Cards</Link></td>
          </tr>
          <tr>
            <td>Track my credits</td>
            <td><Link to={PAGES.MY_CREDITS.PATH} className="nav-path">My Credits</Link></td>
          </tr>
          <tr>
            <td>View credit history</td>
            <td><Link to={PAGES.MY_CREDITS_HISTORY.PATH} className="nav-path">All Credits</Link></td>
          </tr>
          <tr>
            <td>Set my preferences</td>
            <td><Link to={PAGES.PREFERENCES.PATH} className="nav-path">Preferences</Link></td>
          </tr>
          <tr>
            <td>View chat history</td>
            <td><Link to={PAGES.HISTORY.PATH} className="nav-path">Previous Chats</Link></td>
          </tr>
          <tr>
            <td>Manage my account</td>
            <td><Link to={PAGES.ACCOUNT.PATH} className="nav-path">Account</Link></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default GettingStarted;
