import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal, useModal } from '../../components/Modal';
import { ChatHistory, SubscriptionPlan } from '../../types';
import { SHOW_SUBSCRIPTION_MENTIONS } from '../../types';
import { 
  DeleteStatusType, 
  handleVerificationEmail as handleVerificationEmailUtil,
  handleDeleteAllChats as handleDeleteAllChatsUtil,
} from './utils';
import PageHeader from '../../components/PageHeader';
import { useScrollHeight } from '../../hooks/useScrollHeight';
import './Account.scss';

/**
 * Props for the Account component
 * @interface AccountProps
 * @property {React.Dispatch<React.SetStateAction<ChatHistory>>} setChatHistory - Function to update the chat history state
 * @property {React.Dispatch<React.SetStateAction<number>>} setHistoryRefreshTrigger - Function to trigger a refresh of the chat history
 * @property {SubscriptionPlan} subscriptionPlan - The user's current subscription plan ('free' or 'premium')
 */
interface AccountProps {
  setChatHistory: React.Dispatch<React.SetStateAction<ChatHistory>>;
  setHistoryRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
  subscriptionPlan: SubscriptionPlan;
}

const Account: React.FC<AccountProps> = ({ setChatHistory, setHistoryRefreshTrigger, subscriptionPlan }) => {
  const { user, sendVerificationEmail } = useAuth();
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [deleteStatus, setDeleteStatus] = useState<DeleteStatusType>({ type: 'confirm', message: '' });

  const deleteModal = useModal();

  // Use the scroll height hook for this page
  useScrollHeight(true);

  const handleVerificationEmailClick = async (): Promise<void> => {
    const result = await handleVerificationEmailUtil(sendVerificationEmail);
    setMessageType(result.messageType);
    setMessage(result.message);
  };

  const handleDeleteAllChatsClick = async (): Promise<void> => {
    const result = await handleDeleteAllChatsUtil(setChatHistory, setHistoryRefreshTrigger);
    setDeleteStatus(result);
  };

  const handleCloseModal = (): void => {
    deleteModal.close();
    setDeleteStatus({ type: 'confirm', message: '' });
  };

  const renderModalContent = () => {
    switch (deleteStatus.type) {
      case 'success':
        return (
          <div className="modal-container">
            <h2 className="modal-heading--success">Success!</h2>
            <p className="modal-message">{deleteStatus.message}</p>
            <button onClick={handleCloseModal} className="modal-button modal-button--success">
              Close
            </button>
          </div>
        );
      case 'error':
        return (
          <div className="modal-container">
            <h2 className="modal-heading--error">Error</h2>
            <p className="modal-message">{deleteStatus.message}</p>
            <div className="modal-button-container">
              <button onClick={handleCloseModal} className="modal-button modal-button--close">
                Close
              </button>
              <button
                onClick={() => {
                  setDeleteStatus({ type: 'confirm', message: '' });
                  handleDeleteAllChatsClick();
                }}
                className="modal-button modal-button--error"
              >
                Try Again
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="modal-container">
            <h2>Delete All Chat History</h2>
            <p className="modal-message">
              Are you sure you want to delete all chat history? 
              This action cannot be undone.
            </p>
            <div className="modal-button-container">
              <button onClick={handleCloseModal} className="modal-button modal-button--close">
                Cancel
              </button>
              <button
                onClick={handleDeleteAllChatsClick}
                className="modal-button modal-button--error"
              >
                Delete All
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="full-page-layout">
      <PageHeader title="My Account" />
      <div className="full-page-content">
        {user ? (
          <div className="user-info">
            {user.photoURL && (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                className="profile-image"
              />
            )}
            <p><strong>Name:</strong> {user.displayName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p className="email-status">
              <strong>Email Status:</strong>{' '}
              {user.emailVerified ? (
                <span className="verified">Verified ✓</span>
              ) : (
                <span className="unverified">Not Verified</span>
              )}
            </p>
            {SHOW_SUBSCRIPTION_MENTIONS && (
              <p>
                <strong>Subscription Plan:</strong>{' '}
                <span className="subscription-plan">
                  {subscriptionPlan}
                </span>
              </p>
            )}
            {!user.emailVerified && (
              <>
                <button 
                  className="verify-button"
                  onClick={handleVerificationEmailClick}
                >
                  Send Verification Email
                </button>
                {message && (
                  <p className={`message ${messageType}`}>
                    {message}
                  </p>
                )}
              </>
            )}

            <div className="danger-zone">
              <h2 className="danger-zone__title">Danger Zone</h2>
              <p>Once you delete your chat history, there is no going back. Please be certain.</p>
              <button 
                onClick={deleteModal.open}
                className="danger-zone__button"
              >
                Delete All Chat History
              </button>
            </div>
          </div>
        ) : (
          <p>Please sign in to view your account details.</p>
        )}
      </div>

      <Modal 
        isOpen={deleteModal.isOpen} 
        onClose={handleCloseModal}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
}

export default Account;
