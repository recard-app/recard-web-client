import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import HistoryEntry from './HistoryEntry';
import './HistoryPanel.scss';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../../config/firebase';

const apiurl = process.env.REACT_APP_BASE_URL;

// Define the page size limit as a constant
const PAGE_SIZE_LIMIT = 20;

function HistoryPanel({ 
  existingHistoryList, 
  listSize, 
  fullListSize, 
  currentChatId,
  returnCurrentChatId = () => {},
  dateFilter = null,
  onHistoryUpdate
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paginatedList, setPaginatedList] = useState([]);

  useEffect(() => {
    if (user && fullListSize) {
      fetchPagedHistory();
    } else if (!fullListSize) {
      // For sidebar view, just use the first few items
      setPaginatedList([...existingHistoryList]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, listSize));
    }
  }, [fullListSize, currentPage, user]);

  if (!user) return null;

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
      // Weeks (1-3)
      ...[1, 2, 3].map(week => ({
        title: week === 1 ? "Last Week" : `${week} Weeks Ago`,
        entries: [],
        cutoff: new Date(today.getTime() - week * 7 * 24 * 60 * 60 * 1000)
      })),
      // Months (1-12)
      ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => ({
        title: month === 1 ? "Last Month" : `${month} Months Ago`,
        entries: [],
        cutoff: new Date(today.getTime() - month * 30 * 24 * 60 * 60 * 1000)
      })),
      // Years (up to 5)
      ...[1, 2, 3, 4, 5].map(year => ({
        title: year === 1 ? "Last Year" : `${year} Years Ago`,
        entries: [],
        cutoff: new Date(today.getTime() - year * 365 * 24 * 60 * 60 * 1000)
      }))
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

  const fetchPagedHistory = async () => {
    if (!user || !fullListSize) return;
    
    setIsLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.get(`${apiurl}/history/chat_history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          page: currentPage,
          page_size: PAGE_SIZE_LIMIT
        }
      });
      
      if (response.data.chatHistory) {
        setPaginatedList(response.data.chatHistory);
        setPaginationData(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (deletedChatId) => {
    // If we're deleting the current chat, clear it first
    if (deletedChatId === currentChatId) {
      returnCurrentChatId(null);
    }
    
    // Update chatHistory in App.js by filtering out the deleted chat
    if (onHistoryUpdate) {
      onHistoryUpdate(prevHistory => prevHistory.filter(chat => chat.chatId !== deletedChatId));
    }
  };

  // Use paginatedList instead of displayList for the full view
  const displayList = fullListSize 
    ? paginatedList 
    : [...existingHistoryList]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, listSize);

  const renderPagination = () => {
    if (!paginationData || !fullListSize) return null;

    return (
      <div className="pagination-controls">
        <button 
          onClick={() => setCurrentPage(prev => prev - 1)}
          disabled={!paginationData.has_previous}
        >
          Previous
        </button>
        <span className="page-info">
          Page {paginationData.current_page} of {paginationData.total_pages}
        </span>
        <button 
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={!paginationData.has_next}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className='history-panel'>
      {!fullListSize && <h2>Chat History</h2>}
      {isLoading ? (
        <p>Loading chat history...</p>
      ) : displayList.length === 0 ? (
        <p>No chat history available</p>
      ) : (
        <>
          {fullListSize ? (
            <>
              {organizeHistoryByDate(displayList).map(section => (
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
              ))}
              {renderPagination()}
            </>
          ) : (
            // Show simple list for sidebar view
            displayList.map(entry => (
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