import React from 'react';
import FullHistoryPanel from '../../components/HistoryPanel/FullHistoryPanel';
import { Conversation, CreditCard, PAGE_NAMES, PAGE_ICONS, SubscriptionPlan } from '../../types';
import PageHeader from '../../components/PageHeader';
import { useFullHeight } from '../../hooks/useFullHeight';
import './History.scss';

interface HistoryProps {
  existingHistoryList: Conversation[];
  currentChatId: string | null;
  returnCurrentChatId: (chatId: string | null) => void;
  onHistoryUpdate: (updater: (prevHistory: Conversation[]) => Conversation[]) => void;
  subscriptionPlan: SubscriptionPlan;
  creditCards: CreditCard[];
  historyRefreshTrigger: number;
}

function History({
  existingHistoryList,
  currentChatId,
  returnCurrentChatId,
  onHistoryUpdate,
  subscriptionPlan,
  creditCards,
  historyRefreshTrigger
}: HistoryProps): React.ReactElement {
  // Use the full height hook for this page
  useFullHeight(true);

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
          onHistoryUpdate={onHistoryUpdate}
          creditCards={creditCards}
          historyRefreshTrigger={historyRefreshTrigger}
        />
      </div>
    </div>
  );
}

export default History;