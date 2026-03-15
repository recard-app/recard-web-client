import HistoryEntry from './HistoryEntry';
import { InfoDisplay } from '../../elements';
import HistoryPanelSkeleton from './HistoryPanelSkeleton';
import './HistoryPanel.scss';
import {
  Conversation,
} from '../../types';

/**
 * Props interface for the HistoryPanelPreview component
 */
export interface HistoryPanelPreviewProps {
  existingHistoryList: Conversation[];
  listSize?: number;
  currentChatId: string | null;
  returnCurrentChatId: (chatId: string | null) => void;
  onHistoryDelete: (chatId: string) => Promise<void> | void;
  onHistoryRefresh: () => Promise<void> | void;
  loading?: boolean;
}

function HistoryPanelPreview({ 
  existingHistoryList, 
  listSize, 
  currentChatId,
  returnCurrentChatId,
  onHistoryDelete,
  onHistoryRefresh,
  loading = false
}: HistoryPanelPreviewProps) {

  /**
   * Forces a refresh of the history data
   */
  const forceHistoryRefresh = async () => {
    try {
      await onHistoryRefresh();
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
    await onHistoryDelete(deletedChatId);
  };

  // Simple list for preview/sidebar view - sorted and sliced
  const displayList = [...existingHistoryList]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, listSize);

  return (
    <div className="history-panel">
      {loading && displayList.length === 0 ? (
        <HistoryPanelSkeleton variant="sidebar" count={3} />
      ) : displayList.length === 0 ? (
        <InfoDisplay
          type="default"
          message={'No chat history available'}
          showTitle={false}
          transparent={true}
          showIcon={false}
        />
      ) : (
        displayList.map(entry => (
          <HistoryEntry 
            key={entry.chatId} 
            chatEntry={entry}
            currentChatId={currentChatId}
            onDelete={handleDelete}
            refreshHistory={forceHistoryRefresh}
            returnCurrentChatId={returnCurrentChatId}
            variant="sidebar"
          />
        ))
      )}
    </div>
  );
}

export default HistoryPanelPreview; 
