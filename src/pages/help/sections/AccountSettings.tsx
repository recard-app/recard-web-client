import React from 'react';
import { Link } from 'react-router-dom';
import { PAGES } from '../../../types/Pages';
import { HelpSection } from '../components';

const AccountSettings: React.FC = () => {
  return (
    <div className="help-content">
      <h2>Account Settings</h2>
      <p>
        Manage your account, profile, and security settings in{' '}
        <Link to={PAGES.ACCOUNT.PATH} className="nav-path">Account</Link>.
      </p>

      <HelpSection title="Profile Information" defaultExpanded={true}>
        <h4>Display Name</h4>
        <p>Your display name appears throughout the app and in greetings.</p>
        <ol>
          <li>Go to <Link to={PAGES.ACCOUNT.PATH} className="nav-path">Account</Link></li>
          <li>Find the <strong>Profile Information</strong> section</li>
          <li>Click the <strong>Name</strong> row</li>
          <li>Enter your new name in the dialog and click <strong>Save</strong></li>
        </ol>
      </HelpSection>

      <HelpSection title="Email Management" defaultExpanded={true}>
        <h4>Change Your Email</h4>
        <ol>
          <li>Go to <Link to={PAGES.ACCOUNT.PATH} className="nav-path">Account</Link></li>
          <li>Find the <strong>Email</strong> section</li>
          <li>Click to update your email address</li>
          <li>Verify the new email address via the confirmation link</li>
        </ol>

        <div className="callout callout--info">
          <strong>Email verification:</strong> After changing your email, you'll need to verify
          the new address before it becomes active. Check your inbox for a verification link.
        </div>
      </HelpSection>

      <HelpSection title="Password Management" defaultExpanded={true}>
        <h4>Reset Your Password</h4>
        <p>If you signed up with email/password authentication:</p>
        <ol>
          <li>Go to <Link to={PAGES.ACCOUNT.PATH} className="nav-path">Account</Link></li>
          <li>Find the <strong>Password</strong> section</li>
          <li>Click <strong>Reset Password</strong></li>
          <li>Check your email for the password reset link</li>
        </ol>

        <div className="callout callout--tip">
          <strong>Note:</strong> If you signed in with Google, your password is managed through
          your Google account.
        </div>
      </HelpSection>

      <HelpSection title="Sign Out" defaultExpanded={true}>
        <p>To sign out of your account:</p>
        <ol>
          <li>Go to <Link to={PAGES.ACCOUNT.PATH} className="nav-path">Account</Link></li>
          <li>Click <strong>Sign Out</strong> at the bottom of the page</li>
        </ol>
        <p>
          You'll be redirected to the sign-in page. Your data remains saved and will be
          available when you sign back in.
        </p>
      </HelpSection>

      <HelpSection title="Danger Zone" defaultExpanded={true}>
        <p>
          The Danger Zone contains irreversible actions. Use these carefully.
        </p>

        <h4>Delete Chat History</h4>
        <p>Permanently removes all your chat conversations with the AI.</p>
        <ul>
          <li>Your cards and credits remain untouched</li>
          <li>Cannot be undone</li>
          <li>You'll be asked to type "DELETE" to confirm</li>
        </ul>

        <h4>Delete Account</h4>
        <p>Permanently removes your entire account and all associated data:</p>
        <ul>
          <li>All cards and credit tracking data</li>
          <li>All chat history and conversations</li>
          <li>All preferences and settings</li>
          <li>Cannot be undone</li>
        </ul>
        <p>You'll be asked to type "DELETE" to confirm this action.</p>

        <div className="callout callout--warning">
          <strong>This is permanent.</strong> Once deleted, your data cannot be recovered.
          Make sure you want to proceed before confirming.
        </div>
      </HelpSection>

      <HelpSection title="Legal" defaultExpanded={true}>
        <p>
          View the legal agreements that govern your use of the app:
        </p>
        <ul>
          <li><Link to={PAGES.TERMS_OF_SERVICE.PATH} className="nav-path">Terms of Service</Link></li>
          <li><Link to={PAGES.PRIVACY_POLICY.PATH} className="nav-path">Privacy Policy</Link></li>
        </ul>
        <p>
          These are also accessible from the Legal card on your{' '}
          <Link to={PAGES.ACCOUNT.PATH} className="nav-path">Account</Link> page.
        </p>
      </HelpSection>
    </div>
  );
};

export default AccountSettings;
