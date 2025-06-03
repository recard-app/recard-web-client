import React from 'react';
import FullHistoryPanel from '../../components/HistoryPanel/FullHistoryPanel';
import { Conversation, CreditCard, ShowCompletedOnlyPreference, SubscriptionPlan, FREE_PLAN_HISTORY_DAYS, PAGE_NAMES } from '../../types';
import PageHeader from '../../components/PageHeader';
import { useFullHeight } from '../../hooks/useFullHeight';

interface HistoryProps {
  existingHistoryList: Conversation[];
  currentChatId: string | null;
  returnCurrentChatId: (chatId: string | null) => void;
  onHistoryUpdate: (updater: (prevHistory: Conversation[]) => Conversation[]) => void;
  subscriptionPlan: SubscriptionPlan;
  creditCards: CreditCard[];
  historyRefreshTrigger: number;
  showCompletedOnlyPreference: ShowCompletedOnlyPreference;
}

function History({ 
  existingHistoryList, 
  currentChatId, 
  returnCurrentChatId,
  onHistoryUpdate,
  subscriptionPlan,
  creditCards,
  historyRefreshTrigger,
  showCompletedOnlyPreference
}: HistoryProps): React.ReactElement {
  // Use the scroll height hook for this page
  useFullHeight(true);

  const getHistorySubtitle = (): string | undefined => {
    if (subscriptionPlan === 'free') {
      return `Last ${FREE_PLAN_HISTORY_DAYS} Days`;
    }
    return undefined;
  };

  return (
    <div className="full-page-layout">
      <PageHeader 
        title={PAGE_NAMES.TRANSACTION_HISTORY} 
        subtitle={getHistorySubtitle()}
      />
      <div className="full-page-content--no-padding">
        <FullHistoryPanel 
          currentChatId={currentChatId}
          returnCurrentChatId={returnCurrentChatId}
          onHistoryUpdate={onHistoryUpdate}
          subscriptionPlan={subscriptionPlan}
          creditCards={creditCards}
          historyRefreshTrigger={historyRefreshTrigger}
          showCompletedOnlyPreference={showCompletedOnlyPreference}
        />
      </div>
    </div>
  );
}

export default History;