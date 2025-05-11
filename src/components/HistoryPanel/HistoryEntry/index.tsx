import React from 'react';
import './HistoryEntry.scss';
import { useNavigate, useLocation } from 'react-router-dom';
import { Conversation, CreditCard, PLACEHOLDER_CARD_IMAGE, DROPDOWN_ICON, CHAT_DESCRIPTION_MAX_LENGTH } from '../../../types';
import { formatDate, deleteChatEntry } from './utils';
import { Modal, useModal } from '../../Modal';
import { Dropdown, DropdownItem } from '../../../elements/Elements';
import { UserHistoryService } from '../../../services';
import { useState } from 'react';

/**
 * Props interface for the HistoryEntry component
 * @property chatEntry - The conversation data to display
 * @property currentChatId - The ID of the currently active chat
 * @property onDelete - Optional callback when a chat is deleted
 * @property refreshHistory - Optional callback to force history refresh
 * @property returnCurrentChatId - Callback to update the current chat ID
 * @property creditCards - Optional array of available credit cards
 */
interface HistoryEntryProps {
  chatEntry: Conversation;
  currentChatId: string | null;
  onDelete?: (chatId: string) => void;
  refreshHistory?: () => Promise<boolean>;
  returnCurrentChatId: (chatId: string | null) => void;
  creditCards?: CreditCard[];
}

function HistoryEntry({ chatEntry, currentChatId, onDelete, refreshHistory, returnCurrentChatId, creditCards }: HistoryEntryProps): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  // Tracks whether this entry is the currently selected chat
  const isCurrent = chatEntry.chatId === currentChatId;

  // Use the enhanced useModal hook with modalType and entityId
  const { isOpen: isDeleteModalOpen, open: openDeleteModal, close: closeDeleteModal } = 
    useModal(false, 'delete', chatEntry.chatId);
    
  const { isOpen: isRenameModalOpen, open: openRenameModal, close: closeRenameModal } = 
    useModal(false, 'rename', chatEntry.chatId);
  
  // State for the new chat description
  const [newChatDescription, setNewChatDescription] = useState(chatEntry.chatDescription);
  // State for tracking loading state during rename
  const [isRenaming, setIsRenaming] = useState(false);

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
  const handleDeleteClick = (e: React.MouseEvent): void => {
    e.stopPropagation(); // Prevent event bubbling
    openDeleteModal();
  };

  /**
   * Handles clicking the rename option
   */
  const handleRenameClick = (e: React.MouseEvent): void => {
    e.stopPropagation(); // Prevent event bubbling
    setNewChatDescription(chatEntry.chatDescription);
    openRenameModal();
  };

  /**
   * Handles the submission of the rename form
   */
  const handleRenameSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!newChatDescription.trim()) return;
    
    try {
      setIsRenaming(true);
      
      // Always make the direct API call
      await UserHistoryService.updateChatDescription(chatEntry.chatId, newChatDescription);
      
      // Then trigger refresh through parent component
      if (refreshHistory) {
        // Use the refreshHistory callback to trigger a refresh
        await refreshHistory();
      }
      
      closeRenameModal();
    } catch (error) {
      console.error('Error renaming chat:', error);
      alert('Failed to rename chat. Please try again.');
    } finally {
      setIsRenaming(false);
    }
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
      
      closeDeleteModal();
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
            trigger={<img src={DROPDOWN_ICON} alt="Actions" className="action-icon" />}
            align="right"
          >
            <DropdownItem onClick={handleRenameClick}>Rename</DropdownItem>
            <DropdownItem onClick={handleDeleteClick} className="delete-action" icon={DROPDOWN_ICON}>Delete</DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={closeDeleteModal}
        modalType="delete"
        entityId={chatEntry.chatId}
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
              onClick={closeDeleteModal}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Rename Modal */}
      <Modal
        isOpen={isRenameModalOpen}
        onClose={closeRenameModal}
        modalType="rename"
        entityId={chatEntry.chatId}
      >
        <div className="rename-dialog">
          <h3>Rename Chat</h3>
          <form onSubmit={handleRenameSubmit}>
            <input
              type="text"
              value={newChatDescription}
              onChange={(e) => setNewChatDescription(e.target.value)}
              placeholder="Enter a new name for this chat"
              className="rename-input"
              maxLength={CHAT_DESCRIPTION_MAX_LENGTH}
              minLength={1}
              required
              autoFocus
            />
            <div className="character-count">
              {newChatDescription.length}/{CHAT_DESCRIPTION_MAX_LENGTH}
            </div>
            <div className="button-group">
              <button
                type="submit"
                className="confirm-button"
                disabled={isRenaming || !newChatDescription.trim()}
              >
                {isRenaming ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={closeRenameModal}
                disabled={isRenaming}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}

export default HistoryEntry;