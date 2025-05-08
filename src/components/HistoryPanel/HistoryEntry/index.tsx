import React from 'react';
import './HistoryEntry.scss';
import { useNavigate, useLocation } from 'react-router-dom';
import { Conversation, CreditCard } from '../../../types';
import { formatDate, getRecommendedCard, deleteChatEntry } from './utils';
import { Modal, useModal } from '../../Modal';

/**
 * Props interface for the HistoryEntry component
 * @property chatEntry - The conversation data to display
 * @property currentChatId - The ID of the currently active chat
 * @property onDelete - Optional callback when a chat is deleted
 * @property returnCurrentChatId - Callback to update the current chat ID
 * @property creditCards - Optional array of available credit cards
 */
interface HistoryEntryProps {
  chatEntry: Conversation;
  currentChatId: string | null;
  onDelete?: (chatId: string) => void;
  returnCurrentChatId: (chatId: string | null) => void;
  creditCards?: CreditCard[];
}

function HistoryEntry({ chatEntry, currentChatId, onDelete, returnCurrentChatId, creditCards }: HistoryEntryProps): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  // Tracks whether this entry is the currently selected chat
  const isCurrent = chatEntry.chatId === currentChatId;

  // Use the useModal hook for managing the delete confirmation modal
  const deleteModal = useModal();

  /**
   * Handles clicking on the history entry
   * @param e - Click event
   */
  const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.preventDefault();
    if ((e.target as HTMLElement).className !== 'delete-button') {
      navigate(`/${chatEntry.chatId}`, { replace: true });
    }
  };

  /**
   * Handles clicking the delete button
   * @param e - Click event
   */
  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    deleteModal.open(); // Open the modal using the hook
  };

  /**
   * Handles the confirmation of chat deletion
   * Makes API call to delete the chat and updates UI accordingly
   */
  const handleDeleteConfirm = async (): Promise<void> => {
    try {
      await deleteChatEntry(chatEntry.chatId, currentChatId, {
        onDelete,
        returnCurrentChatId,
        navigate,
        currentPath: location.pathname
      });
      deleteModal.close();
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat. Please try again.');
    }
  };

  // Stores the recommended card information for this chat entry
  const recommendedCard = getRecommendedCard(chatEntry.solutions, creditCards);

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
        isOpen={deleteModal.isOpen} 
        onClose={deleteModal.close}
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
              onClick={deleteModal.close}
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