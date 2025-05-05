import React from 'react';
import HistoryPanel from '../../components/HistoryPanel';
import { Link } from 'react-router-dom';
import { Conversation, CreditCard, SubscriptionPlan } from '../../types';

interface HistoryProps {
  returnHistoryList: (history: Conversation[]) => void;
  existingHistoryList: Conversation[];
  currentChatId: string | null;
  refreshTrigger: boolean;
  returnCurrentChatId: (chatId: string | null) => void;
  onHistoryUpdate: (updater: (prevHistory: Conversation[]) => Conversation[]) => void;
  subscriptionPlan: SubscriptionPlan;
  creditCards: CreditCard[];
}

function History({ 
  returnHistoryList, 
  existingHistoryList, 
  currentChatId, 
  refreshTrigger, 
  returnCurrentChatId,
  onHistoryUpdate,
  subscriptionPlan,
  creditCards
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
          returnHistoryList={returnHistoryList} 
          existingHistoryList={existingHistoryList}
          currentChatId={currentChatId}
          refreshTrigger={refreshTrigger}
          returnCurrentChatId={returnCurrentChatId}
          onHistoryUpdate={onHistoryUpdate}
          subscriptionPlan={subscriptionPlan}
          creditCards={creditCards}
        />
      </div>
    </div>
  );
}

export default History;