import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal, useModal } from '../../components/Modal';
import { auth } from '../../config/firebase';
import axios from 'axios';

const apiurl = import.meta.env.VITE_BASE_URL;

function Account({ setChatHistory, setHistoryRefreshTrigger, subscriptionPlan }) {
  const { user, sendVerificationEmail } = useAuth();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [deleteStatus, setDeleteStatus] = useState({ type: 'confirm', message: '' });

  const deleteModal = useModal();

  const handleVerificationEmail = async () => {
    try {
      await sendVerificationEmail();
      setMessageType('success');
      setMessage('Verification email sent! Please check your inbox.');
    } catch (error) {
      setMessageType('error');
      setMessage(error.message || 'Failed to send verification email. Please try again later.');
    }
  };

  const handleDeleteAllChats = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.delete(`${apiurl}/users/history/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setChatHistory([]);
        setHistoryRefreshTrigger(prev => prev + 1);
        setDeleteStatus({ 
          type: 'success', 
          message: 'All chat history has been deleted successfully.' 
        });
      } else {
        throw new Error('Failed to delete chat history');
      }
    } catch (error) {
      console.error('Error deleting chat history:', error);
      setDeleteStatus({ 
        type: 'error', 
        message: 'Failed to delete chat history. Please try again.' 
      });
    }
  };

  const handleCloseModal = () => {
    deleteModal.close();
    setDeleteStatus({ type: 'confirm', message: '' });
  };

  const renderModalContent = () => {
    switch (deleteStatus.type) {
      case 'success':
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2 style={{ color: '#4CAF50' }}>Success!</h2>
            <p style={{ margin: '20px 0' }}>{deleteStatus.message}</p>
            <button
              onClick={handleCloseModal}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: '#4CAF50',
                color: 'white'
              }}
            >
              Close
            </button>
          </div>
        );
      case 'error':
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2 style={{ color: '#f44336' }}>Error</h2>
            <p style={{ margin: '20px 0' }}>{deleteStatus.message}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                onClick={handleCloseModal}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: '#fff'
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setDeleteStatus({ type: 'confirm', message: '' });
                  handleDeleteAllChats();
                }}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: '#f44336',
                  color: 'white'
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        );
      default: // 'confirm' case
        return (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Delete All Chat History</h2>
            <p style={{ margin: '20px 0' }}>
              Are you sure you want to delete all chat history? 
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                onClick={handleCloseModal}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: '#fff'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllChats}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: '#ff0000',
                  color: 'white'
                }}
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
            {user.picture && (
              <img 
                src={user.picture} 
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
            <p><strong>Name:</strong> {user.name}</p>
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
                  onClick={handleVerificationEmail}
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
