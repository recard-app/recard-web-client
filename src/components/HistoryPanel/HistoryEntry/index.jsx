import React, { useState } from 'react';
import './HistoryEntry.scss';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../../../config/firebase';
import Modal from '../../Modal';

const apiurl = import.meta.env.VITE_BASE_URL;

function HistoryEntry({ chatEntry, currentChatId, onDelete, returnCurrentChatId, creditCards }) {
  const navigate = useNavigate();
  const isCurrent = chatEntry.chatId === currentChatId;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Get the recommended card details from solutions array and creditCards
  const getRecommendedCard = () => {
    const recommendedSolution = chatEntry.solutions?.[0];
    if (!recommendedSolution) return null;

    // Find matching card details using the solution's id
    const cardDetails = creditCards?.find(card => card.id === recommendedSolution.id);
    
    return {
      name: cardDetails?.CardName || recommendedSolution.cardName,
      image: cardDetails?.CardImage || 'https://placehold.co/20x20'
    };
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
    
    // After 24 hours, show Month Day, Time format
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // convert 0 to 12
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    
    return `${months[date.getMonth()]} ${date.getDate()}, ${hours}:${minutesStr} ${ampm}`;
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
      await axios.delete(`${apiurl}/users/history/${chatEntry.chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update both local and parent state
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

  const recommendedCard = getRecommendedCard();

  return (
    <>
      <div 
        className={`history-entry ${isCurrent ? 'current' : ''}`}
        id={chatEntry.chatId}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
        title={chatEntry.chatDescription}
      >
        <div className="entry-content">
          <p className="entry-title">{chatEntry.chatDescription}</p>
          {recommendedCard && (
            <p className="recommended-card">
              <img src={recommendedCard.image} alt={recommendedCard.name} className="card-thumbnail" />
              {recommendedCard.name}
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