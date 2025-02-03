import React from 'react';
import HistoryPanel from '../components/HistoryPanel';
import { Link } from 'react-router-dom';

function History({ returnHistoryList, existingHistoryList, currentChatId, refreshTrigger, returnCurrentChatId }) {
  // Calculate the date 90 days ago
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  // Filter function to pass to HistoryPanel
  const dateFilter = (entry) => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= ninetyDaysAgo;
  };

  return (
    <div className="history-page">
      <h1>Chat History (Last 90 Days)</h1>
      <Link to="/">Back to Home</Link>
      <div className="history-content">
        <HistoryPanel 
          fullListSize={true} 
          returnHistoryList={returnHistoryList} 
          existingHistoryList={existingHistoryList}
          currentChatId={currentChatId}
          refreshTrigger={refreshTrigger}
          returnCurrentChatId={returnCurrentChatId}
          dateFilter={dateFilter}
        />
      </div>
    </div>
  );
}

export default History;