import React from 'react';
import { Link } from 'react-router-dom';
import { PAGES } from '../../../types/Pages';
import { HelpSection } from '../components';

const ChatHistory: React.FC = () => {
  return (
    <div className="help-content">
      <h2>Chat History</h2>
      <p>
        Access and manage your past conversations with the AI assistant.
      </p>

      <HelpSection title="Accessing Previous Chats" defaultExpanded={true}>
        <p>
          View all your past conversations in{' '}
          <Link to={PAGES.HISTORY.PATH} className="nav-path">Previous Chats</Link>.
        </p>
        <h4>How to Access</h4>
        <ul>
          <li>Click <strong>Previous Chats</strong> in the sidebar navigation</li>
          <li>Or use the menu icon and select Previous Chats</li>
        </ul>
        <p>
          Conversations are listed with the most recent at the top. Each entry shows a preview
          of the conversation topic.
        </p>
      </HelpSection>

      <HelpSection title="Navigating Conversations" defaultExpanded={true}>
        <h4>Opening a Chat</h4>
        <p>Click on any conversation to open it and view the full exchange.</p>

        <h4>Continuing a Conversation</h4>
        <p>
          When you open a previous chat, you can continue the conversation by typing a new
          message. The AI will have context from your previous messages in that conversation.
        </p>

        <div className="callout callout--tip">
          <strong>Tip:</strong> If you want to start fresh without the previous context,
          start a new chat instead of continuing an old one.
        </div>
      </HelpSection>

      <HelpSection title="Starting New Chats" defaultExpanded={true}>
        <p>To start a new conversation:</p>
        <ul>
          <li>Click the <strong>New Chat</strong> button in the sidebar</li>
          <li>Or navigate to <Link to={PAGES.HOME.PATH} className="nav-path">Home</Link> and
            start typing</li>
        </ul>
        <p>
          Each new chat starts with a clean slate. The AI won't have context from previous
          conversations unless you're continuing an existing chat.
        </p>
      </HelpSection>

      <HelpSection title="Chat History Settings" defaultExpanded={true}>
        <p>
          You can control whether your conversations are saved in{' '}
          <Link to={PAGES.PREFERENCES.PATH} className="nav-path">Preferences</Link>.
        </p>

        <h4>Track Chat History</h4>
        <ul>
          <li><strong>Enabled (default):</strong> Conversations are saved and accessible in
            Previous Chats</li>
          <li><strong>Disabled:</strong> Conversations are not saved after you leave</li>
        </ul>

        <div className="callout callout--info">
          <strong>Note:</strong> Disabling chat history tracking only affects new conversations.
          Previously saved chats will still be available until you delete them.
        </div>
      </HelpSection>

      <HelpSection title="Deleting Chat History" defaultExpanded={true}>
        <p>To delete all your chat history:</p>
        <ol>
          <li>Go to <Link to={PAGES.ACCOUNT.PATH} className="nav-path">Account</Link></li>
          <li>Scroll to the <strong>Danger Zone</strong> section</li>
          <li>Click <strong>Delete Chat History</strong></li>
          <li>Type "DELETE" to confirm</li>
        </ol>

        <div className="callout callout--warning">
          <strong>This is permanent.</strong> Deleted chat history cannot be recovered.
        </div>
      </HelpSection>
    </div>
  );
};

export default ChatHistory;
