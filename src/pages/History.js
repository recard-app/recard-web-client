import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import HistoryPanel from '../components/HistoryPanel';

function History({ returnHistoryList, existingHistoryList }) {
  const { user } = useAuth();
  const [chatHistory, setChatHistory] = useState([]);

  return (
    <div className="history-page">
      <h1>Chat History</h1>
      <div className="history-content">
        <HistoryPanel fullListSize={true} returnHistoryList={returnHistoryList} existingHistoryList={existingHistoryList} />
      </div>
    </div>
  );
}

export default History;
