import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import HistoryEntry from './HistoryEntry';
import './HistoryPanel.scss';
import { useNavigate } from 'react-router-dom';

const apiurl = process.env.REACT_APP_BASE_URL;

function HistoryPanel({ returnHistoryList, existingHistoryList, listSize, fullListSize, refreshTrigger, currentChatId }) {
  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    returnHistoryList(historyList);
  }, [historyList]);

  useEffect(() => {
    const fetchHistoryList = async () => {
      // Only fetch if user is logged in
      if (!user) return;

      if (fullListSize) setIsLoading(true);
      setError(null);

      try {
        const token = await auth.currentUser.getIdToken();
        const endpoint = `${apiurl}/history/get_list${listSize ? `?limit=${listSize}` : ''}`;
        
        const response = await axios.get(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setHistoryList(response.data);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Failed to load chat history');
      } finally {
        if (fullListSize) setIsLoading(false);
      }
    };

    fetchHistoryList();
  }, [user, listSize, refreshTrigger]);

  // Return null if no user is logged in
  if (!user) return null;

  if (isLoading && fullListSize) {
    return <div className="history-panel">Loading...</div>;
  }

  if (error) {
    return <div className="history-panel">Error: {error}</div>;
  }

  return (
    <div className='history-panel'>
      {!fullListSize && <h2>Chat History</h2>}
      {historyList.length === 0 ? (
        <p>No chat history available</p>
      ) : (
        <>
          {historyList.map(entry => (
            <HistoryEntry 
              key={entry.chatId} 
              chatEntry={entry}
              currentChatId={currentChatId}
            />
          ))}
          {!fullListSize && (
            <button 
              className="view-all-button"
              onClick={() => navigate('/history')}
            >
              View All History
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default HistoryPanel;