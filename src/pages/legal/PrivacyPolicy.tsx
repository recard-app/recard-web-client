import React from 'react';
import { APP_NAME, CONTACT_EMAIL } from '../../types';
import LegalPageLayout from './LegalPageLayout';

const PrivacyPolicy: React.FC = () => {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="February 20, 2026" pageNameKey="PRIVACY_POLICY">
      <h3>1. Information We Collect</h3>
      <p>
        We collect the following information when you use {APP_NAME}:
      </p>
      <ul>
        <li><strong>Account information:</strong> email address, display name (provided during registration or via Google sign-in)</li>
        <li><strong>Account metadata:</strong> account activity timestamps (such as account creation and login dates)</li>
        <li><strong>Chat history:</strong> your conversations with our AI assistant, including questions and recommendations</li>
        <li><strong>Card selections:</strong> the credit cards you add to your portfolio and your preferred card settings</li>
        <li><strong>Card financial context:</strong> card names, annual fees, earning rates, credit balances, and category selections from your portfolio are shared with AI providers alongside your chat messages to generate personalized recommendations</li>
        <li><strong>Preferences:</strong> custom AI instructions, chat history settings, and display preferences</li>
        <li><strong>Credit tracking data:</strong> your credit usage records and benefit tracking information</li>
        <li><strong>Server logs:</strong> server-side request logs containing user identifiers, request metadata, and abbreviated chat content for debugging and service monitoring</li>
        <li><strong>Rate limit violation data:</strong> IP address and user-agent string, collected only when rate limit violations occur, for security and abuse prevention purposes</li>
      </ul>
      <p>
        We do <strong>not</strong> collect financial account numbers, credit card numbers, Social Security numbers,
        or any banking credentials. We do <strong>not</strong> use client-side analytics scripts or tracking pixels.
      </p>

      <h3>2. How We Use Your Information</h3>
      <p>
        We use your information to:
      </p>
      <ul>
        <li>Provide personalized AI credit card recommendations based on your card portfolio</li>
        <li>Send your chat messages, card portfolio data, and display name to third-party AI providers for processing</li>
        <li>Track and manage your credit card benefits and statement credits</li>
        <li>Maintain your chat history and conversation context</li>
        <li>Improve the accuracy and relevance of our AI recommendations</li>
        <li>Communicate with you about your account and service updates</li>
        <li>Ensure the security and integrity of the Service, including rate limiting and abuse prevention</li>
      </ul>

      <h3>3. Third-Party Services</h3>
      <p>
        {APP_NAME} uses the following third-party services to operate. Your data may be processed by these services:
      </p>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Purpose</th>
              <th>Data Shared</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><a href="https://privacy.openai.com/policies" target="_blank" rel="noopener noreferrer">OpenAI</a></td>
              <td>AI chat processing and recommendations</td>
              <td>Chat messages, card portfolio context, display name</td>
            </tr>
            <tr>
              <td><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Gemini</a></td>
              <td>AI chat processing and recommendations</td>
              <td>Chat messages, card portfolio context, display name</td>
            </tr>
            <tr>
              <td><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Firebase (Google)</a></td>
              <td>Authentication and data storage</td>
              <td>Account information, chat history, card selections, preferences, credit tracking data</td>
            </tr>
            <tr>
              <td><a href="https://www.langchain.com/privacy-policy" target="_blank" rel="noopener noreferrer">LangSmith (LangChain)</a></td>
              <td>AI quality monitoring and tracing</td>
              <td>Chat interactions, AI responses</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Each third-party service is governed by its own privacy policy. We encourage you to review their policies
        to understand how your data is handled.
      </p>
      <p>
        LangSmith tracing is used on all chat interactions for quality monitoring and cannot currently be disabled
        on a per-user basis. If you do not want your chat interactions traced, do not use the chat feature.
      </p>

      <h3>4. Cookies and Local Storage</h3>
      <p>
        {APP_NAME} uses minimal browser storage:
      </p>
      <ul>
        <li><strong>Firebase authentication cookies:</strong> essential for maintaining your login session. These are required for the Service to function and cannot be disabled.</li>
        <li><strong>Local storage:</strong> we store your sidebar display preference (<code>sidePanelOpen</code>) locally in your browser. This data never leaves your device.</li>
      </ul>
      <p>
        We do <strong>not</strong> use advertising cookies, third-party tracking cookies, or analytics cookies.
      </p>

      <h3>5. Data Retention</h3>
      <ul>
        <li><strong>Chat history:</strong> retained until you delete it through the app or delete your account</li>
        <li><strong>Account data:</strong> retained until you delete your account</li>
        <li><strong>Credit tracking data:</strong> retained until you delete your account</li>
        <li><strong>Server logs:</strong> retained for up to 30 days, then automatically deleted</li>
        <li><strong>AI processing logs:</strong> retained by third-party AI providers according to their respective retention policies (see Section 3 for provider privacy policy links)</li>
      </ul>

      <h3>6. Your Rights</h3>
      <p>
        You have the following rights regarding your data:
      </p>
      <ul>
        <li><strong>Access:</strong> view your data at any time through the app (card selections, chat history, preferences, credits)</li>
        <li><strong>Deletion:</strong> delete your chat history, individual conversations, or your entire account and all associated data</li>
        <li><strong>Export:</strong> request a copy of your data by contacting us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We will respond to export requests within 30 days</li>
        <li><strong>Correction:</strong> update your account information and preferences at any time through the app</li>
      </ul>

      <h3>7. Data Security</h3>
      <p>
        We take reasonable measures to protect your information, including:
      </p>
      <ul>
        <li>Encrypted connections (HTTPS/TLS) for all data in transit</li>
        <li>Firebase security rules to protect stored data</li>
        <li>Authentication tokens with expiration for API access</li>
      </ul>
      <p>
        We do not store financial account numbers, credit card numbers, or banking credentials. No method of
        transmission or storage is 100% secure, and we cannot guarantee absolute security.
      </p>

      <h3>8. Children's Privacy</h3>
      <p>
        {APP_NAME} is not intended for users under the age of 18. We do not knowingly collect personal information
        from children. If you believe a child under 18 has provided us with personal information, please contact us
        and we will delete the information promptly.
      </p>

      <h3>9. International Data Transfer</h3>
      <p>
        {APP_NAME} is operated in the United States. If you access the Service from outside the United States, your
        information will be transferred to, stored, and processed in the United States, where data protection laws
        may differ from those in your jurisdiction. By using the Service, you consent to the transfer of your
        information to the United States.
      </p>

      <h3>10. Data Breach Notification</h3>
      <p>
        In the event of a data breach that compromises your personal information, we will notify affected users via
        email within 30 days of confirming the breach. The notification will describe the nature of the breach, the data
        involved, and the steps we are taking in response.
      </p>

      <h3>11. Changes to This Policy</h3>
      <p>
        We may update this Privacy Policy from time to time. We will notify users of material changes by updating
        the "Last updated" date at the top of this page. We encourage you to review this policy periodically.
      </p>

      <h3>12. Contact Us</h3>
      <p>
        If you have questions or concerns about this Privacy Policy or our data practices, please contact us at{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;
