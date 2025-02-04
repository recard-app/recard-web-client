import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import HistoryEntry from './HistoryEntry';
import './HistoryPanel.scss';
import { useNavigate } from 'react-router-dom';


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

  // Process the list without maintaining local state
  let displayList = [...existingHistoryList].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
  
  // Apply date filter if provided
  if (dateFilter) {
    displayList = displayList.filter(dateFilter);
  }

  // Apply limit if provided
  if (listSize) {
    displayList = displayList.slice(0, listSize);
  }

  return (
    <div className='history-panel'>
      {!fullListSize && <h2>Chat History</h2>}
      {displayList.length === 0 ? (
        <p>No chat history available</p>
      ) : (
        <>
          {fullListSize ? (
            // Show organized sections for full history view
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
                  />
                ))}
              </div>
            ))
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