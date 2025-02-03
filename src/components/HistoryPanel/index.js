import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import HistoryEntry from './HistoryEntry';
import './HistoryPanel.scss';
import { useNavigate } from 'react-router-dom';

const apiurl = process.env.REACT_APP_BASE_URL;

function HistoryPanel({ 
  returnHistoryList, 
  existingHistoryList, 
  listSize, 
  fullListSize, 
  refreshTrigger, 
  currentChatId,
  returnCurrentChatId = () => {},
  dateFilter = null,
}) {
  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Function to organize history into sections
  const organizeHistoryByDate = (entries) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const sections = [
      { 
        title: "Today",
        entries: [],
        cutoff: today
      },
      {
        title: "Yesterday",
        entries: [],
        cutoff: yesterday
      },
      {
        title: "Last Week",
        entries: [],
        cutoff: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        title: "2 Weeks Ago",
        entries: [],
        cutoff: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)
      },
      {
        title: "3 Weeks Ago",
        entries: [],
        cutoff: new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000)
      },
      {
        title: "Last Month",
        entries: [],
        cutoff: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        title: "2 Months Ago",
        entries: [],
        cutoff: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)
      },
      {
        title: "3 Months Ago",
        entries: [],
        cutoff: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
      }
    ];

    entries.forEach(entry => {
      const entryDate = new Date(entry.timestamp);
      for (let section of sections) {
        if (entryDate >= section.cutoff) {
          section.entries.push(entry);
          break;
        }
      }
    });

    // Only return sections that have entries
    return sections.filter(section => section.entries.length > 0);
  };

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
        
        let filteredData = response.data;
        if (dateFilter) {
          filteredData = response.data.filter(dateFilter);
        }
        
        setHistoryList(filteredData);
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

  const handleDelete = async (deletedChatId) => {
    // If we're deleting the current chat, clear it first
    if (deletedChatId === currentChatId) {
      returnCurrentChatId(null);
    }
    setHistoryList(prevList => prevList.filter(entry => entry.chatId !== deletedChatId));
  };

  return (
    <div className='history-panel'>
      {!fullListSize && <h2>Chat History</h2>}
      {historyList.length === 0 ? (
        <p>No chat history available</p>
      ) : (
        <>
          {fullListSize ? (
            // Show organized sections for full history view
            organizeHistoryByDate(historyList).map(section => (
              <div key={section.title} className="history-section">
                <h3 className="section-title">{section.title}</h3>
                {section.entries.map(entry => (
                  <HistoryEntry 
                    key={entry.chatId} 
                    chatEntry={entry}
                    currentChatId={currentChatId}
                    onDelete={handleDelete}
                    returnCurrentChatId={returnCurrentChatId}
                  />
                ))}
              </div>
            ))
          ) : (
            // Show simple list for sidebar view
            historyList.map(entry => (
              <HistoryEntry 
                key={entry.chatId} 
                chatEntry={entry}
                currentChatId={currentChatId}
                onDelete={handleDelete}
                returnCurrentChatId={returnCurrentChatId}
              />
            ))
          )}
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