import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal, useModal } from '../../components/Modal';
import { ChatHistory, SubscriptionPlan } from '../../types/UserTypes';
import { 
  DeleteStatusType, 
  handleVerificationEmail as handleVerificationEmailUtil,
  handleDeleteAllChats as handleDeleteAllChatsUtil,
} from './utils';
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
            <h2 style={{ color: '#4CAF50' }}>Success!</h2>
            <p style={{ margin: '20px 0' }}>{deleteStatus.message}</p>
            <button onClick={handleCloseModal} className="modal-button modal-button--success">
              Close
            </button>
          </div>
        );
      case 'error':
        return (
          <div className="modal-container">
            <h2 style={{ color: '#f44336' }}>Error</h2>
            <p style={{ margin: '20px 0' }}>{deleteStatus.message}</p>
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
            <p style={{ margin: '20px 0' }}>
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
    <div className="account-page">
      <h1>My Account</h1>
      <div className="account-content">
        {user ? (
          <div className="user-info">
            {user.photoURL && (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '50%',
                  marginBottom: '20px'
                }} 
              />
            )}
            <p><strong>Name:</strong> {user.displayName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p>
              <strong>Email Status:</strong>{' '}
              {user.emailVerified ? (
                <span className="verified">Verified ✓</span>
              ) : (
                <span className="unverified">Not Verified</span>
              )}
            </p>
            <p>
              <strong>Subscription Plan:</strong>{' '}
              <span style={{ 
                textTransform: 'capitalize',
              }}>
                {subscriptionPlan}
              </span>
            </p>
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

            {/* Danger Zone Section */}
            <div className="danger-zone" style={{ 
              marginTop: '2rem', 
              padding: '1rem', 
              border: '1px solid #ff0000', 
              borderRadius: '4px',
              width: '100%',
              maxWidth: '500px'
            }}>
              <h2 style={{ color: '#ff0000' }}>Danger Zone</h2>
              <p>Once you delete your chat history, there is no going back. Please be certain.</p>
              <button 
                onClick={deleteModal.open}
                style={{
                  backgroundColor: '#ff0000',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '1rem'
                }}
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
