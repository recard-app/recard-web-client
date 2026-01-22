import React from 'react';
import { Link } from 'react-router-dom';
import { PAGES } from '../../../types/Pages';
import { APP_NAME } from '../../../types';
import { HelpSection } from '../components';

const FAQ: React.FC = () => {
  return (
    <div className="help-content">
      <h2>Frequently Asked Questions</h2>

      <div className="faq">
        <div className="faq__category">
          <h3 className="faq__category-title">Getting Started</h3>

          <HelpSection title={`What is ${APP_NAME}?`} defaultExpanded={false}>
            <p>
              {APP_NAME} helps you maximize credit card rewards by recommending the best card for each
              purchase and tracking your credits. Add your cards, ask our AI for recommendations,
              and never miss a benefit again.
            </p>
          </HelpSection>

          <HelpSection title={`Is ${APP_NAME} free?`} defaultExpanded={false}>
            <p>
              Yes, {APP_NAME} is free to use. All features including full chat history access
              are available to all users.
            </p>
          </HelpSection>

          <HelpSection title="Is my data secure?" defaultExpanded={false}>
            <p>
              Yes. We don't store card numbers or sensitive financial data. We only store card names
              and benefit information to provide recommendations and track credits.
            </p>
          </HelpSection>

          <HelpSection title="Do I need to link my bank?" defaultExpanded={false}>
            <p>
              No. You manually add cards and track credits. No bank connection is required. We never
              see your transactions, balances, or account numbers.
            </p>
          </HelpSection>
        </div>

        <div className="faq__category">
          <h3 className="faq__category-title">Cards & Setup</h3>

          <HelpSection title="How do I add a card?" defaultExpanded={false}>
            <p>
              Go to <Link to={PAGES.MY_CARDS.PATH} className="nav-path">My Cards</Link>, click
              "Add Card", search for your card by name or issuer, and select it. Benefits load automatically.
            </p>
          </HelpSection>

          <HelpSection title="What if my card isn't in the database?" defaultExpanded={false}>
            <p>
              Contact us and we'll add it. We're constantly expanding our card database to include
              more issuers and cards.
            </p>
          </HelpSection>

          <HelpSection title="Can I add multiple of the same card?" defaultExpanded={false}>
            <p>
              There's no need - benefits are the same regardless of how many physical cards you have.
              Add it once to track all its benefits.
            </p>
          </HelpSection>

          <HelpSection title="What's the difference between freezing and removing a card?" defaultExpanded={false}>
            <p>
              <strong>Freezing:</strong> Card stays in your portfolio but is excluded from recommendations.
              Good for cards you're not actively using.
            </p>
            <p>
              <strong>Removing:</strong> Card is deleted from your account along with its credit
              tracking history. Use this for closed accounts.
            </p>
          </HelpSection>

          <HelpSection title="Why should I set an anniversary date?" defaultExpanded={false}>
            <p>
              Some credits reset on your card's anniversary date instead of January 1. Setting the
              anniversary date ensures accurate credit tracking for these benefits.
            </p>
          </HelpSection>
        </div>

        <div className="faq__category">
          <h3 className="faq__category-title">Credits & Tracking</h3>

          <HelpSection title="What are credits?" defaultExpanded={false}>
            <p>
              Credits are fixed-value benefits you can redeem from your card. Unlike points (which you earn),
              credits are "use it or lose it" - they reset at the end of each period.
            </p>
          </HelpSection>

          <HelpSection title="How do I mark a credit as used?" defaultExpanded={false}>
            <p>
              Go to <Link to={PAGES.MY_CREDITS.PATH} className="nav-path">My Credits</Link>, click
              on the credit, select "Used" (or "Partial" if partially used), and save.
            </p>
          </HelpSection>

          <HelpSection title="When do credits reset?" defaultExpanded={false}>
            <p>Depends on the credit:</p>
            <ul>
              <li><strong>Monthly:</strong> 1st of each month</li>
              <li><strong>Quarterly:</strong> Jan 1, Apr 1, Jul 1, Oct 1</li>
              <li><strong>Semi-Annual:</strong> Jan 1, Jul 1</li>
              <li><strong>Annual (Calendar):</strong> January 1</li>
              <li><strong>Annual (Anniversary):</strong> Your card open date</li>
            </ul>
          </HelpSection>

          <HelpSection title="Why is my credit showing the wrong period?" defaultExpanded={false}>
            <p>
              Check your anniversary date in card settings. If it's not set correctly, anniversary-based
              credits may show incorrect periods.
            </p>
          </HelpSection>

          <HelpSection title="What do the status colors mean?" defaultExpanded={false}>
            <ul>
              <li><strong>Green:</strong> Fully used</li>
              <li><strong>Yellow:</strong> Partially used</li>
              <li><strong>Blue:</strong> Available</li>
              <li><strong>Gray:</strong> Inactive/not tracked</li>
            </ul>
          </HelpSection>
        </div>

        <div className="faq__category">
          <h3 className="faq__category-title">AI & Recommendations</h3>

          <HelpSection title="What can I ask the AI?" defaultExpanded={false}>
            <p>
              Ask about best cards for purchases, compare cards, get strategy advice, or research
              new cards. Examples:
            </p>
            <ul>
              <li>"What's my best card for groceries?"</li>
              <li>"Compare my travel cards"</li>
              <li>"Is the Amex Gold worth it for me?"</li>
            </ul>
          </HelpSection>

          <HelpSection title="How does the AI know which card to recommend?" defaultExpanded={false}>
            <p>
              The AI considers your cards' multipliers, available credits, spending bonuses, and
              any preferences you've set. It weighs these factors to suggest the best option.
            </p>
          </HelpSection>

          <HelpSection title="Can I teach it my preferences?" defaultExpanded={false}>
            <p>
              Yes! Go to <Link to={PAGES.PREFERENCES.PATH} className="nav-path">Preferences</Link> and
              set custom instructions. Tell it things like "I prefer cashback over points" or
              "I'm trying to maximize airline miles."
            </p>
          </HelpSection>

          <HelpSection title="Does the AI see my transactions?" defaultExpanded={false}>
            <p>
              No. The AI only knows about your cards and their benefits. It doesn't have access
              to your transactions, balances, or any other account information.
            </p>
          </HelpSection>
        </div>

        <div className="faq__category">
          <h3 className="faq__category-title">Account & Data</h3>

          <HelpSection title="How do I delete my data?" defaultExpanded={false}>
            <p>
              Go to <Link to={PAGES.ACCOUNT.PATH} className="nav-path">Account</Link> and scroll
              to the Danger Zone section. You can delete chat history, card data, or your entire account.
            </p>
          </HelpSection>

          <HelpSection title="Can I export my data?" defaultExpanded={false}>
            <p>
              This feature is coming soon.
            </p>
          </HelpSection>

          <HelpSection title="How do I change my email?" defaultExpanded={false}>
            <p>
              Go to <Link to={PAGES.ACCOUNT.PATH} className="nav-path">Account</Link> to
              update your account email address.
            </p>
          </HelpSection>

          <HelpSection title="How do I cancel premium?" defaultExpanded={false}>
            <p>
              Go to <Link to={PAGES.ACCOUNT.PATH} className="nav-path">Account</Link>, find the
              Subscription section, and click Cancel.
            </p>
          </HelpSection>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
