import React from 'react';
import HistoryPanel from '../../components/HistoryPanel';
import { Conversation, CreditCard, ShowCompletedOnlyPreference, SubscriptionPlan, FREE_PLAN_HISTORY_DAYS } from '../../types';
import PageHeader from '../../components/PageHeader';

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
  const getHistorySubtitle = (): string | undefined => {
    if (subscriptionPlan === 'free') {
      return `Last ${FREE_PLAN_HISTORY_DAYS} Days`;
    }
    return undefined;
  };

  return (
    <div className="history-page">
      <PageHeader 
        title="Transaction History" 
        subtitle={getHistorySubtitle()}
      />
      <div className="history-content">
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