import React, { useState } from 'react';
import './HistoryEntry.scss';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../../../config/firebase';
import Modal from '../../Modal';
const apiurl = process.env.REACT_APP_BASE_URL;

function HistoryEntry({ chatEntry, currentChatId, onDelete, returnCurrentChatId }) {
  const navigate = useNavigate();
  const isCurrent = chatEntry.chatId === currentChatId;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Get the recommended card name directly from the chatEntry
  const getRecommendedCard = () => {
    return chatEntry.recommendedCard || null;
  };

  // Format the timestamp to a readable date
  const formatDate = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    // Less than a minute
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    // Less than an hour
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // Less than a day
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Less than a month
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    // Less than a year
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }
    
    // A year or more
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (e.target.className !== 'delete-button') {
      navigate(`/${chatEntry.chatId}`, { replace: true });
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(`${apiurl}/history/delete/${chatEntry.chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update the UI
      if (onDelete) {
        onDelete(chatEntry.chatId);
      }
      setShowDeleteModal(false);

      // Finally, navigate if it was the current chat
      if (chatEntry.chatId === currentChatId) {
        returnCurrentChatId(null);
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat. Please try again.');
    }
  };

  return (
    <>
      <div 
        className={`history-entry ${isCurrent ? 'current' : ''}`}
        id={chatEntry.chatId}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      >
        <div className="entry-content">
          <p className="entry-title">{chatEntry.chatDescription}</p>
          {getRecommendedCard() && (
            <p className="recommended-card">
              Recommended: {getRecommendedCard()}
            </p>
          )}
          <p className="timestamp">{formatDate(chatEntry.timestamp)}</p>
        </div>
        {isCurrent && <span className="current-indicator">Current</span>}
        <button 
          className="delete-button"
          onClick={handleDeleteClick}
        >
          Delete
        </button>
      </div>

      <Modal 
        show={showDeleteModal} 
        handleClose={() => setShowDeleteModal(false)}
      >
        <div className="delete-confirmation">
          <h3>Delete Chat History</h3>
          <p>Are you sure you want to delete this chat? This action cannot be undone.</p>
          <div className="button-group">
            <button 
              className="confirm-button"
              onClick={handleDeleteConfirm}
            >
              Delete
            </button>
            <button 
              className="cancel-button"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default HistoryEntry;