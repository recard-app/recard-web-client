import React from 'react';
import { SUPPORT_EMAIL } from '../../../types';
import { HelpSection } from '../components';

const Troubleshooting: React.FC = () => {
  return (
    <div className="help-content">
      <h2>Troubleshooting</h2>
      <p>
        Having issues? Here are solutions to common problems.
      </p>

      <div className="faq">
        <HelpSection title="The AI gave wrong info about my card" defaultExpanded={false}>
          <p>
            Card data is updated regularly, but benefits can change. If you notice incorrect
            information:
          </p>
          <ol>
            <li>Verify the info with your card issuer's website</li>
            <li>Email us at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> so we can update our database</li>
            <li>The fix will apply to all users with that card</li>
          </ol>
        </HelpSection>

        <HelpSection title="My credits aren't showing correctly" defaultExpanded={false}>
          <p>Try these steps:</p>
          <ol>
            <li><strong>Refresh the page</strong> - Sometimes data needs to reload</li>
            <li><strong>Check anniversary date</strong> - For anniversary-based credits, ensure your
              card's open date is set correctly</li>
            <li><strong>Verify the credit exists</strong> - Check your card issuer's website to
              confirm the credit is still offered</li>
          </ol>
        </HelpSection>

        <HelpSection title="I can't find a specific card" defaultExpanded={false}>
          <p>If your card isn't appearing in search:</p>
          <ul>
            <li>Try the full official card name (e.g., "Chase Sapphire Preferred" not "CSP")</li>
            <li>Try searching by the bank name</li>
            <li>Check for alternative spellings</li>
            <li>If still not found, email us at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> to add it</li>
          </ul>
        </HelpSection>

        <HelpSection title="The app is slow or not loading" defaultExpanded={false}>
          <ol>
            <li><strong>Refresh the page</strong> - Press Ctrl+R (Cmd+R on Mac)</li>
            <li><strong>Clear browser cache</strong> - Clear cookies and cached data</li>
            <li><strong>Try a different browser</strong> - Chrome, Firefox, Safari, or Edge</li>
            <li><strong>Check your internet connection</strong></li>
            <li><strong>Disable browser extensions</strong> - Some may interfere</li>
          </ol>
        </HelpSection>

        <HelpSection title="My credit status reset unexpectedly" defaultExpanded={false}>
          <p>
            Credits automatically reset based on their frequency. This is normal behavior:
          </p>
          <ul>
            <li><strong>Monthly credits</strong> reset on the 1st of each month</li>
            <li><strong>Quarterly credits</strong> reset Jan 1, Apr 1, Jul 1, Oct 1</li>
            <li><strong>Annual credits</strong> reset on Jan 1 or your anniversary</li>
          </ul>
          <p>
            If a reset seems incorrect, check the credit's earning frequency in your card details.
          </p>
        </HelpSection>

        <HelpSection title="I'm not receiving email notifications" defaultExpanded={false}>
          <p>
            Email notifications are coming soon. We're working on features like credit expiration
            reminders and monthly summaries. For now, check the app regularly or use the Daily
            Digest to stay on top of your credits.
          </p>
          <p>
            If you're having trouble receiving account-related emails (like password resets or
            email verification):
          </p>
          <ol>
            <li>Check your spam/junk folder</li>
            <li>Add our email to your contacts</li>
            <li>Verify your email address in Account settings</li>
          </ol>
        </HelpSection>

        <HelpSection title="The page looks broken or styled incorrectly" defaultExpanded={false}>
          <ol>
            <li><strong>Hard refresh</strong> - Ctrl+Shift+R (Cmd+Shift+R on Mac)</li>
            <li><strong>Clear cache</strong> - Clear your browser's cached files</li>
            <li><strong>Try incognito/private mode</strong> - Rules out extension issues</li>
            <li><strong>Update your browser</strong> - Ensure you're on the latest version</li>
          </ol>
        </HelpSection>

        <HelpSection title="I accidentally deleted something" defaultExpanded={false}>
          <p>Unfortunately, most deletions are permanent. However:</p>
          <ul>
            <li><strong>Cards</strong> can be re-added from the database</li>
            <li><strong>Credit history</strong> for re-added cards starts fresh</li>
            <li><strong>Chat history</strong> cannot be recovered once deleted</li>
          </ul>
        </HelpSection>

        <HelpSection title="I'm seeing an error message" defaultExpanded={false}>
          <p>If you encounter an error:</p>
          <ol>
            <li>Note the error message (screenshot if possible)</li>
            <li>Try refreshing the page</li>
            <li>If it persists, try logging out and back in</li>
            <li>Clear your browser cache and try again</li>
          </ol>
        </HelpSection>
      </div>

    </div>
  );
};

export default Troubleshooting;
