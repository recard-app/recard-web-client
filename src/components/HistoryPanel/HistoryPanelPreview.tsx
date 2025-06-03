import React, { useEffect } from 'react';
import HistoryEntry from './HistoryEntry';
import './HistoryPanel.scss';
import {
  Conversation, 
  CreditCard,
} from '../../types';

/**
 * Props interface for the HistoryPanelPreview component
 */
export interface HistoryPanelPreviewProps {
  existingHistoryList: Conversation[];
  listSize?: number;
  currentChatId: string | null;
  returnCurrentChatId: (chatId: string | null) => void;
  onHistoryUpdate: (updater: (prevHistory: Conversation[]) => Conversation[]) => void;
  creditCards: CreditCard[];
  historyRefreshTrigger: number;
}

function HistoryPanelPreview({ 
  existingHistoryList, 
  listSize, 
  currentChatId,
  returnCurrentChatId,
  onHistoryUpdate,
  creditCards,
  historyRefreshTrigger
}: HistoryPanelPreviewProps) {

  // Effect to handle history refresh triggers
  useEffect(() => {
    // This effect runs when historyRefreshTrigger changes
    // The actual data refresh is handled by the parent component
    // This is just to ensure the component re-renders when needed
  }, [historyRefreshTrigger]);

  /**
   * Forces a refresh of the history data
   */
  const forceHistoryRefresh = async () => {
    try {
      // Trigger history refresh via onHistoryUpdate
      onHistoryUpdate(prevHistory => [...prevHistory]);
      return true; // Return success
    } catch (error) {
      console.error('Failed to refresh history:', error);
      return false; // Return failure
    }
  };

  /**
   * Wrapper function to handle deletion
   */
  const handleDelete = async (deletedChatId: string) => {
    // Remove the deleted conversation from the list
    onHistoryUpdate(prevHistory => 
      prevHistory.filter(conversation => conversation.chatId !== deletedChatId)
    );
    
    // If the deleted chat was the current chat, clear the current chat
    if (deletedChatId === currentChatId) {
      returnCurrentChatId(null);
    }
  };

  // Simple list for preview/sidebar view - sorted and sliced
  const displayList = existingHistoryList
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, listSize);

  return (
    <div className="history-panel">
      {displayList.length === 0 ? (
        <p>No transaction history available</p>
      ) : (
        displayList.map(entry => (
          <HistoryEntry 
            key={entry.chatId} 
            chatEntry={entry}
            currentChatId={currentChatId}
            onDelete={handleDelete}
            refreshHistory={forceHistoryRefresh}
            returnCurrentChatId={returnCurrentChatId}
            creditCards={creditCards}
          />
        ))
      )}
    </div>
  );
}

export default HistoryPanelPreview; 