import React from 'react';
import HistoryPanel from '../../components/HistoryPanel';
import { Conversation, CreditCard, ShowCompletedOnlyPreference, SubscriptionPlan, FREE_PLAN_HISTORY_DAYS } from '../../types';
import PageHeader from '../../components/PageHeader';
import { useScrollHeight } from '../../hooks/useScrollHeight';

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
  useScrollHeight(true);

  const getHistorySubtitle = (): string | undefined => {
    if (subscriptionPlan === 'free') {
      return `Last ${FREE_PLAN_HISTORY_DAYS} Days`;
    }
    return undefined;
  };

  return (
    <div className="full-page-layout">
      <PageHeader 
        title="Transaction History" 
        subtitle={getHistorySubtitle()}
      />
      <div className="full-page-content--no-padding">
        <HistoryPanel 
          fullListSize={true} 
          existingHistoryList={existingHistoryList}
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