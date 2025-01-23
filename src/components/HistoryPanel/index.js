import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import HistoryEntry from './HistoryEntry';
import './HistoryPanel.scss';

const apiurl = process.env.REACT_APP_BASE_URL;

function HistoryPanel({ returnHistoryList, existingHistoryList }) {
  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    returnHistoryList(historyList);
}, [historyList]);

  useEffect(() => {
    const fetchHistoryList = async () => {
      // Only fetch if user is logged in
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        const token = await auth.currentUser.getIdToken();
        const response = await axios.get(`${apiurl}/history/get_list`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setHistoryList(response.data);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Failed to load chat history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoryList();
  }, [user]); // Re-fetch when user changes

  if (isLoading) {
    return <div className="history-panel">Loading...</div>;
  }

  if (error) {
    return <div className="history-panel">Error: {error}</div>;
  }

  return (
    <div className='history-panel'>
      <h2>Chat History</h2>
      {historyList.length === 0 ? (
        <p>No chat history available</p>
      ) : (
        historyList.map(entry => (
          <HistoryEntry 
            key={entry.chatId} 
            chatEntry={entry}
          />
        ))
      )}
    </div>
  );
}

export default HistoryPanel;