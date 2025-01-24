import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Account() {
  const { user, sendVerificationEmail } = useAuth();
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleVerificationEmail = async () => {
    console.log(user);
    try {
      await sendVerificationEmail();
      setMessageType('success');
      setMessage('Verification email sent! Please check your inbox.');
    } catch (error) {
      setMessageType('error');
      setMessage(error.message || 'Failed to send verification email. Please try again later.');
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
          </div>
        ) : (
          <p>Please sign in to view your account details.</p>
        )}
      </div>
    </div>
  );
}

export default Account;
