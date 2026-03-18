import React from 'react';
import FullHistoryPanel from '../../components/HistoryPanel/FullHistoryPanel';
import { PAGE_NAMES, PAGE_ICONS } from '../../types';
import PageHeader from '../../components/PageHeader';
import { useFullHeight } from '../../hooks/useFullHeight';
import { useEdgeToEdge } from '../../hooks/useEdgeToEdge';
import './History.scss';

interface HistoryProps {
  currentChatId: string | null;
  returnCurrentChatId: (chatId: string | null) => void;
  onHistoryDelete: (chatId: string) => Promise<void> | void;
  onHistoryRefresh: () => Promise<void> | void;
  historyRefreshTrigger: number;
}

function History({
  currentChatId,
  returnCurrentChatId,
  onHistoryDelete,
  onHistoryRefresh,
  historyRefreshTrigger
}: HistoryProps): React.ReactElement {
  // Use the full height hook for this page
  useFullHeight(true);
  useEdgeToEdge(true);

  return (
    <div className="standard-page-layout">
      <PageHeader
        title={PAGE_NAMES.TRANSACTION_HISTORY}
        icon={PAGE_ICONS.TRANSACTION_HISTORY.MINI}
      />
      <div className="standard-page-content--no-padding">
        <FullHistoryPanel
          currentChatId={currentChatId}
          returnCurrentChatId={returnCurrentChatId}
          onHistoryDelete={onHistoryDelete}
          onHistoryRefresh={onHistoryRefresh}
          historyRefreshTrigger={historyRefreshTrigger}
        />
      </div>
    </div>
  );
}

export default History;
