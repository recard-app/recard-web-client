import React from 'react';
import HistoryPanel from '../components/HistoryPanel';
import { Link } from 'react-router-dom';

function History({ 
  returnHistoryList, 
  existingHistoryList, 
  currentChatId, 
  refreshTrigger, 
  returnCurrentChatId,
  onHistoryUpdate,
  subscriptionPlan,
  creditCards
}) {
  const getHistoryTitle = () => {
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