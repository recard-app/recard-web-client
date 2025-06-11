import React from 'react';
import './HistoryEntry.scss';
import { useNavigate, useLocation } from 'react-router-dom';
import { Conversation, CreditCard, PLACEHOLDER_CARD_IMAGE, DROPDOWN_ICON, CHAT_DESCRIPTION_MAX_LENGTH, TEMP_ICON } from '../../../types';
import { formatDate, deleteChatEntry } from './utils';
import { Modal, useModal } from '../../Modal';
import { InfoDisplay } from '../../../elements';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu/dropdown-menu';
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
    useModal({ 
      initialState: false, 
      modalType: 'delete', 
      entityId: chatEntry.chatId 
    });
    
  const { isOpen: isRenameModalOpen, open: openRenameModal, close: closeRenameModal } = 
    useModal({ 
      initialState: false, 
      modalType: 'rename', 
      entityId: chatEntry.chatId 
    });
  
  // State for the new chat description
  const [newChatDescription, setNewChatDescription] = useState(chatEntry.chatDescription);
  // State for tracking loading state during rename
  const [isRenaming, setIsRenaming] = useState(false);
  // State for error message
  const [renameError, setRenameError] = useState<string | null>(null);

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
    setRenameError(null); // Clear any previous errors
    openRenameModal();
  };

  /**
   * Handles the submission of the rename form
   */
  const handleRenameSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    // Validate input
    if (!newChatDescription.trim()) {
      return;
    }
    
    // Clear any previous errors
    setRenameError(null);
    
    // Set loading state
    setIsRenaming(true);
    
    try {
      // 1. Update the chat description via API
      await UserHistoryService.updateChatDescription(
        chatEntry.chatId,
        newChatDescription
      );
      
      // 2. First, close the modal - This is the key change
      closeRenameModal();
      
      // 3. Then refresh history if available (don't wait for it)
      if (refreshHistory) {
        refreshHistory().catch(error => {
          console.error('Failed to refresh history:', error);
          // No need to handle UI since modal is already closed
        });
      }
    } catch (error) {
      // Handle API error
      console.error('Failed to rename chat:', error);
      setRenameError('Failed to rename chat. Please try again.');
    } finally {
      // Reset loading state
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
      // Using InfoDisplay in an alert is not typical - typically this would be added to the modal.
      // For demonstration purposes, replacing the alert, but a better approach would be to add an
      // error state and render the InfoDisplay within the modal.
      setRenameError('Failed to delete chat. Please try again.');
      // Not showing an alert anymore: alert('Failed to delete chat. Please try again.');
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="action-icon-button">
                <img src={DROPDOWN_ICON} alt="Actions" className="action-icon1" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleRenameClick}>
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDeleteClick} 
                variant="destructive"
                icon={TEMP_ICON}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            {renameError && (
              <InfoDisplay
                type="error"
                message={renameError}
              />
            )}
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