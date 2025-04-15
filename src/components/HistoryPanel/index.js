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
  subscriptionPlan,
  userCardDetails
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paginatedList, setPaginatedList] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year
  const [firstEntryDate, setFirstEntryDate] = useState(null);
  
  // Generate months for dropdown
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  // Modify getAvailableYears to handle subscription type
  const getAvailableYears = () => {
    const now = new Date();
    const cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
    const years = [];

    if (subscriptionPlan === 'premium' && firstEntryDate) {
      // For premium users, show years from first entry up to current
      const startYear = firstEntryDate.getFullYear();
      const endYear = now.getFullYear();
      for (let year = endYear; year >= startYear; year--) {
        years.push(year);
      }
    } else {
      // For free users, only show years within 90 days
      const startYear = cutoffDate.getFullYear();
      const endYear = now.getFullYear();
      for (let year = endYear; year >= startYear; year--) {
        years.push(year);
      }
    }

    return years;
  };

  // Update getAvailableMonths to not include the empty option
  const getAvailableMonths = () => {
    const now = new Date();
    const cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
    
    let availableMonths = [...months]; // Use the months array without the empty option

    if (subscriptionPlan === 'premium' && firstEntryDate) {
      // For premium users, limit months based on firstEntryDate
      if (selectedYear === firstEntryDate.getFullYear()) {
        availableMonths = availableMonths.filter(month => 
          month.value >= firstEntryDate.getMonth() + 1
        );
      }
    } else {
      // For free users, only show months within 90 days
      if (selectedYear === cutoffDate.getFullYear()) {
        availableMonths = availableMonths.filter(month => 
          month.value >= cutoffDate.getMonth() + 1
        );
      }
      if (selectedYear === now.getFullYear()) {
        availableMonths = availableMonths.filter(month => 
          month.value <= now.getMonth() + 1
        );
      }
    }

    return availableMonths;
  };

  useEffect(() => {
    if (user && fullListSize) {
      setCurrentPage(1); // Reset to first page when filters change
      fetchPagedHistory();
    } else if (!fullListSize) {
      setPaginatedList([...existingHistoryList]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, listSize));
    }
  }, [fullListSize, user, selectedMonth, selectedYear]); // Remove currentPage from dependencies

  // Add separate useEffect for page changes
  useEffect(() => {
    if (user && fullListSize) {
      fetchPagedHistory();
    }
  }, [currentPage]);

  // Add a function to fetch the first entry date
  const fetchFirstEntryDate = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.get(`${apiurl}/history/history_start`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.firstEntryDate) {
        const date = new Date(response.data.firstEntryDate);
        setFirstEntryDate(date);
      }
    } catch (error) {
      console.error('Error fetching first entry date:', error);
    }
  };

  // Add useEffect to fetch first entry date when component mounts
  useEffect(() => {
    if (user && fullListSize) {
      fetchFirstEntryDate();
    }
  }, [user, fullListSize]);

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

  const handleClearFilter = () => {
    setSelectedMonth('');
    setCurrentPage(1);
  };

  const fetchPagedHistory = async () => {
    if (!user || !fullListSize) return;
    
    setIsLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const params = {
        page: currentPage,
        page_size: PAGE_SIZE_LIMIT,
      };

      // Only add month if it's selected (year is always selected)
      if (selectedMonth !== '') {
        params.month = selectedMonth.toString();
        params.year = selectedYear.toString();
      }

      const response = await axios.get(`${apiurl}/history/chat_history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params
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

    const totalPages = paginationData.total_pages;
    const currentPage = paginationData.current_page;

    // Calculate which page numbers to show
    let pageNumbers = [];
    if (totalPages <= 5) {
      // If 5 or fewer pages, show all pages
      pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Calculate the range of pages to show
      let start = Math.max(currentPage - 2, 1);
      let end = Math.min(start + 4, totalPages);

      // Adjust start if we're near the end
      if (end === totalPages) {
        start = Math.max(end - 4, 1);
      }
      // Adjust end if we're near the start
      if (start === 1) {
        end = Math.min(5, totalPages);
      }

      pageNumbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }

    return (
      <div className="pagination-controls">
        <button 
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="pagination-edge-button"
        >
          &lt;&lt;
        </button>
        <button 
          onClick={() => setCurrentPage(prev => prev - 1)}
          disabled={!paginationData.has_previous}
          className="pagination-nav-button"
        >
          &lt;
        </button>
        <div className="pagination-numbers">
          {pageNumbers.map(pageNum => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`pagination-number ${pageNum === currentPage ? 'active' : ''}`}
            >
              {pageNum}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={!paginationData.has_next}
          className="pagination-nav-button"
        >
          &gt;
        </button>
        <button 
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="pagination-edge-button"
        >
          &gt;&gt;
        </button>
      </div>
    );
  };

  const shouldShowUpgradeMessage = () => {
    if (!fullListSize || !paginationData || subscriptionPlan === 'premium') return false;
    
    // Only show on last page
    if (paginationData.current_page !== paginationData.total_pages) return false;

    const now = new Date();
    const cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
    
    // If viewing a specific month/year (statement view)
    if (selectedMonth !== '') {
      const selectedDate = new Date(selectedYear, selectedMonth - 1, 1);

      // Show upgrade message if the selected date is more than 90 days old
      return selectedDate < cutoffDate;
    }

    // For regular transaction view, show message if there are entries older than 90 days
    return firstEntryDate && firstEntryDate < cutoffDate;
  };

  const getUpgradeMessageText = () => {
    if (!selectedMonth) {
      return 'Unlock your complete transaction history with Premium';
    }

    const now = new Date();
    const cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
    const selectedDate = new Date(selectedYear, selectedMonth - 1, 1);

    // Calculate months difference
    const monthsDiff = (cutoffDate.getFullYear() - selectedDate.getFullYear()) * 12 + 
                      (cutoffDate.getMonth() - selectedDate.getMonth());

    // If the selected month is close to the 90-day cutoff (within 1 month)
    if (monthsDiff <= 1 && selectedDate < cutoffDate) {
      return 'Any transactions older than 90 days may be hidden from this statement. Unlock all transaction history with Premium';
    }

    // If the selected month is well beyond the 90-day cutoff
    return `Access your complete ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear} transaction history with Premium`;
  };

  const renderUpgradeMessage = () => {
    if (!shouldShowUpgradeMessage()) return null;

    return (
      <div className="upgrade-message">
        <p>{getUpgradeMessageText()}</p>
      </div>
    );
  };

  const renderDateFilter = () => {
    if (!fullListSize) return null;

    return (
      <div className="date-filter">
        <label className="filter-label">View Monthly Statement</label>
        <div className={`filter-wrapper ${selectedMonth && selectedYear ? 'active' : ''}`}>
          <select 
            value={selectedYear}
            onChange={(e) => {
              const newYear = e.target.value ? parseInt(e.target.value) : '';
              setSelectedYear(newYear);
              // Reset month when year changes to prevent invalid combinations
              setSelectedMonth('');
              setCurrentPage(1);
            }}
            className="year-select"
          >
            <option value="">Select Year</option>
            {getAvailableYears().map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select 
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value ? parseInt(e.target.value) : '');
              setCurrentPage(1);
            }}
            className="month-select"
            disabled={!selectedYear}
          >
            <option value="">Select Month</option>
            {selectedYear && getAvailableMonths().map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          {selectedMonth && (
            <button 
              className="clear-filter"
              onClick={handleClearFilter}
              aria-label="Clear filter"
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className='history-panel'>
      {!fullListSize && <h2>Recent Transactions</h2>}
      {fullListSize && renderDateFilter()}
      {isLoading ? (
        <p>Loading transaction history...</p>
      ) : displayList.length === 0 ? (
        <p>No transaction history available for this period</p>
      ) : (
        <>
          {fullListSize ? (
            <>
              {/* Show filtered results without categories */}
              {(selectedMonth !== '' && selectedYear !== '') ? (
                <div className="history-entries">
                  {displayList.map(entry => (
                    <HistoryEntry 
                      key={entry.chatId} 
                      chatEntry={entry}
                      currentChatId={currentChatId}
                      onDelete={handleDelete}
                      returnCurrentChatId={returnCurrentChatId}
                      userCardDetails={userCardDetails}
                    />
                  ))}
                </div>
              ) : (
                // Show categorized view only when no filters are applied
                organizeHistoryByDate(displayList).map(section => (
                  <div key={section.title} className="history-section">
                    <h3 className="section-title">{section.title}</h3>
                    {section.entries.map(entry => (
                      <HistoryEntry 
                        key={entry.chatId} 
                        chatEntry={entry}
                        currentChatId={currentChatId}
                        onDelete={handleDelete}
                        returnCurrentChatId={returnCurrentChatId}
                        userCardDetails={userCardDetails}
                      />
                    ))}
                  </div>
                ))
              )}
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
                userCardDetails={userCardDetails}
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