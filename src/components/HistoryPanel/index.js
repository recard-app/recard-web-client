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
  onHistoryUpdate,
  subscriptionPlan
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

    // Helper function to get month name and year
    const getMonthYear = (date) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    // Helper function to get unique key for month/year
    const getMonthKey = (date) => {
        return date.getFullYear() * 12 + date.getMonth();
    };

    // Group entries by their time section
    const sections = entries.reduce((acc, entry) => {
        const entryDate = new Date(entry.timestamp);
        const daysDiff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));

        let key, title;

        if (daysDiff < 1) {
            key = 'today';
            title = 'Today';
        } else if (daysDiff < 2) {
            key = 'yesterday';
            title = 'Yesterday';
        } else if (daysDiff < 7) {
            key = 'lastweek';
            title = 'Last Week';
        } else if (daysDiff < 14) {
            key = '2weeks';
            title = '2 Weeks Ago';
        } else if (daysDiff < 21) {
            key = '3weeks';
            title = '3 Weeks Ago';
        } else {
            // Group by month for entries older than 21 days
            key = getMonthKey(entryDate);
            title = getMonthYear(entryDate);
        }

        if (!acc[key]) {
            acc[key] = { title, entries: [], key };
        }
        acc[key].entries.push(entry);
        return acc;
    }, {});

    // Sort sections and entries
    const orderedSections = Object.values(sections)
        .sort((a, b) => {
            // Special handling for non-month sections
            const specialOrder = ['today', 'yesterday', 'lastweek', '2weeks', '3weeks'];
            const aIndex = specialOrder.indexOf(a.key);
            const bIndex = specialOrder.indexOf(b.key);
            
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            
            // For month sections, sort by their numeric key (most recent first)
            return b.key - a.key;
        })
        .map(section => ({
            title: section.title,
            entries: section.entries.sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            )
        }));

    return orderedSections;
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

  const renderUpgradeMessage = () => {
    if (!fullListSize || subscriptionPlan === 'premium') return null;
    
    // Only show on the last page
    if (!paginationData || paginationData.current_page !== paginationData.total_pages) return null;

    return (
      <div className="upgrade-message">
        <p>To see the rest of your chat history, upgrade to premium</p>
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
              {renderUpgradeMessage()}
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