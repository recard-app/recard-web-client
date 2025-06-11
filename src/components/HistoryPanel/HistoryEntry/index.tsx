import React from 'react';
import './HistoryEntry.scss';
import { useNavigate, useLocation } from 'react-router-dom';
import { Conversation, CreditCard, PLACEHOLDER_CARD_IMAGE, DROPDOWN_ICON, CHAT_DESCRIPTION_MAX_LENGTH, TEMP_ICON, LOADING_ICON } from '../../../types';
import { formatDate, deleteChatEntry } from './utils';
import { InfoDisplay } from '../../../elements';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/dialog/alert-dialog';
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

  // Dialog state management
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  
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
    setIsDeleteModalOpen(true);
  };

  /**
   * Handles clicking the rename option
   */
  const handleRenameClick = (e: React.MouseEvent): void => {
    e.stopPropagation(); // Prevent event bubbling
    setNewChatDescription(chatEntry.chatDescription);
    setRenameError(null); // Clear any previous errors
    setIsRenameModalOpen(true);
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
      setIsRenameModalOpen(false);
      
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
      
      setIsDeleteModalOpen(false);
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
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat History</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="button-group">
              <AlertDialogAction destructive onClick={handleDeleteConfirm}>
                Delete
              </AlertDialogAction>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Modal */}
      <Dialog open={isRenameModalOpen} onOpenChange={setIsRenameModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
          </DialogHeader>
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
          </form>
          <DialogFooter>
            <div className="button-group">
              <button
                type="submit"
                className={`button ${isRenaming ? 'loading icon' : ''}`}
                disabled={isRenaming || !newChatDescription.trim()}
                onClick={handleRenameSubmit}
              >
                {isRenaming && <img src={LOADING_ICON} alt="Loading" />}
                {isRenaming ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className="button outline"
                onClick={() => setIsRenameModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default HistoryEntry;