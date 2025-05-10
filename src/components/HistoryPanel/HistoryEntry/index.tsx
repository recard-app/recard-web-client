import React from 'react';
import './HistoryEntry.scss';
import { useNavigate, useLocation } from 'react-router-dom';
import { Conversation, CreditCard, PLACEHOLDER_CARD_IMAGE, TEMP_ICON } from '../../../types';
import { formatDate, deleteChatEntry } from './utils';
import { Modal, useModal } from '../../Modal';
import { Dropdown } from '../../../elements/Elements';

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
    // Make sure we're not clicking on the action icon or its dropdown
    if (!(e.target as HTMLElement).closest('.actions-dropdown')) {
      navigate(`/${chatEntry.chatId}`, { replace: true });
    }
  };

  /**
   * Handles clicking the delete option
   */
  const handleDeleteClick = (): void => {
    deleteModal.open();
  };

  /**
   * Placeholder for rename functionality
   */
  const handleRenameClick = (): void => {
    console.log('Rename functionality to be implemented');
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

  // Get the selected card if it exists
  const selectedCard = chatEntry.cardSelection && chatEntry.cardSelection !== '' 
    ? creditCards?.find(card => card.id === chatEntry.cardSelection)
    : null;

  const displayCard = selectedCard 
    ? { name: selectedCard.CardName, image: selectedCard.CardImage || PLACEHOLDER_CARD_IMAGE }
    : null;

  return (
    <>
      <div 
        className={`history-entry ${isCurrent ? 'current' : ''} ${displayCard ? 'has-selected-card' : ''}`}
        id={chatEntry.chatId}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
        title={chatEntry.chatDescription}
      >
        <div className="entry-content">
          <p className="entry-title">{chatEntry.chatDescription}</p>
          {displayCard && (
            <p className="selected-card-display">
              <img src={displayCard.image} alt={displayCard.name} className="card-thumbnail" />
              {displayCard.name}
            </p>
          )}
          <p className="timestamp">{formatDate(chatEntry.timestamp)}</p>
          {isCurrent && <span className="current-indicator">Current</span>}
        </div>
        
        <div className="actions-dropdown">
          <Dropdown
            trigger={<img src={TEMP_ICON} alt="Actions" className="action-icon" />}
            align="right"
          >
            <button onClick={handleRenameClick}>Rename</button>
            <button onClick={handleDeleteClick} className="delete-action">Delete</button>
          </Dropdown>
        </div>
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