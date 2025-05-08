import React from 'react';
import HistoryPanel from '../../components/HistoryPanel';
import { Link } from 'react-router-dom';
import { Conversation, CreditCard, SubscriptionPlan } from '../../types';

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
  const getHistoryTitle = (): string => {
    if (subscriptionPlan === 'premium') {
      return 'Transaction History';
    }
    return 'Transaction History - Last 90 Days';
  };

  return (
    <div className="history-page">
      <h1>{getHistoryTitle()}</h1>
      <Link to="/">Back to Home</Link>
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
        />
      </div>
    </div>
  );
}

export default History;