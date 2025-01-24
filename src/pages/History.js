import React from 'react';
import HistoryPanel from '../components/HistoryPanel';
import { Link } from 'react-router-dom';

function History({ returnHistoryList, existingHistoryList, currentChatId, refreshTrigger, returnCurrentChatId }) {

  return (
    <div className="history-page">
      <h1>Chat History</h1>
      <Link to="/">Back to Home</Link>
      <div className="history-content">
        <HistoryPanel 
          fullListSize={true} 
          returnHistoryList={returnHistoryList} 
          existingHistoryList={existingHistoryList}
          currentChatId={currentChatId}
          refreshTrigger={refreshTrigger}
          returnCurrentChatId={returnCurrentChatId}
        />
      </div>
    </div>
  );
}

export default History;