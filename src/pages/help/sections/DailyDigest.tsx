import React from 'react';
import { Link } from 'react-router-dom';
import { PAGES } from '../../../types/Pages';
import { DAILY_ZEN_FEATURE_NAME } from '../../../types';
import { HelpSection } from '../components';

const DailyDigest: React.FC = () => {
  return (
    <div className="help-content">
      <h2>{DAILY_ZEN_FEATURE_NAME}</h2>
      <p>
        The {DAILY_ZEN_FEATURE_NAME} is an AI-generated summary that helps you stay on top of your
        credit card benefits each day.
      </p>

      <HelpSection title={`What is the ${DAILY_ZEN_FEATURE_NAME}?`} defaultExpanded={true}>
        <p>
          The {DAILY_ZEN_FEATURE_NAME} is a personalized summary that appears when you start a new chat.
          It gives you a quick overview of what's happening with your credits and highlights
          actions you should take.
        </p>

        <h4>When It Appears</h4>
        <ul>
          <li>Shows once per day when you open a new chat</li>
          <li>Appears below the welcome message</li>
          <li>Refreshes at midnight Eastern Time</li>
          <li>You can also regenerate the digest manually using the refresh button</li>
        </ul>

        <div className="callout callout--info">
          <strong>Timezone:</strong> The {DAILY_ZEN_FEATURE_NAME} uses Eastern Time for day boundaries.
          Your digest refreshes at 12:00 AM ET each day.
        </div>
      </HelpSection>

      <HelpSection title="Content Sections" defaultExpanded={true}>
        <p>Your {DAILY_ZEN_FEATURE_NAME} may include these sections based on your credit activity:</p>

        <table>
          <thead>
            <tr>
              <th>Section</th>
              <th>What It Shows</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Expiring Credits</strong></td>
              <td>Credits expiring soon and the dollar value at risk if not used</td>
            </tr>
            <tr>
              <td><strong>Quick Win</strong></td>
              <td>The single most actionable credit you should use today</td>
            </tr>
            <tr>
              <td><strong>Monthly Progress</strong></td>
              <td>How much you've used vs. how much is available this month</td>
            </tr>
            <tr>
              <td><strong>Value Realized</strong></td>
              <td>Total credits you've redeemed so far this year</td>
            </tr>
          </tbody>
        </table>

        <h4>Beginning of Month Sections</h4>
        <p>During the first few days of each month, you may also see:</p>
        <ul>
          <li><strong>New Credits Available:</strong> Credits that just refreshed for the new period</li>
          <li><strong>Last Month Recap:</strong> Summary of what you used (and missed) last month</li>
        </ul>
      </HelpSection>

      <HelpSection title="Understanding the Digest" defaultExpanded={true}>
        <h4>Expiring Credits</h4>
        <p>
          Credits that will reset soon without being used. The digest highlights credits
          expiring in the next 7-14 days and shows the dollar amount you'd lose.
        </p>

        <h4>Quick Win</h4>
        <p>
          A specific action you can take today. For example: "Use your $10 Grubhub credit
          from your Amex Gold before it resets on the 1st."
        </p>

        <h4>Progress Tracking</h4>
        <p>
          The monthly progress shows your utilization rate. For example: "You've used $45
          of $120 available this month" helps you see if you're on track.
        </p>

        <div className="callout callout--tip">
          <strong>Tip:</strong> If your digest shows credits expiring soon, check your{' '}
          <Link to={PAGES.MY_CREDITS.PATH} className="nav-path">My Credits</Link> page
          to see the full details and update your status after using them.
        </div>
      </HelpSection>

      <HelpSection title="Tips for Using the Digest" defaultExpanded={true}>
        <ul>
          <li>
            <strong>Check it daily:</strong> A quick glance each morning helps you spot
            expiring credits before it's too late
          </li>
          <li>
            <strong>Act on Quick Wins:</strong> These are designed to be easy, actionable
            items you can do today
          </li>
          <li>
            <strong>Review monthly recaps:</strong> At the start of each month, see what
            you missed and adjust your habits
          </li>
          <li>
            <strong>Track your progress:</strong> Watch your "Value Realized" grow throughout
            the year
          </li>
        </ul>
      </HelpSection>
    </div>
  );
};

export default DailyDigest;
