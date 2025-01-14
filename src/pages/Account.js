import React from 'react';
import { useAuth } from '../context/AuthContext';

function Account() {
  const { user } = useAuth();

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
          </div>
        ) : (
          <p>Please sign in to view your account details.</p>
        )}
      </div>
    </div>
  );
}

export default Account;
