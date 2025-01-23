import React from 'react';
import './HistoryEntry.scss';

function HistoryEntry({ chatEntry }) {
  // Format the timestamp to a readable date
  const formatDate = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    // Less than a minute
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    // Less than an hour
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // Less than a day
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Less than a month
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    // Less than a year
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }
    
    // A year or more
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
  };

  return (
    <div className='history-entry' id={chatEntry.chatId}>
      <div className='history-entry-content'>
        <p className='history-description'>{chatEntry.chatDescription}</p>
        <span className='history-timestamp'>{formatDate(chatEntry.timestamp)}</span>
      </div>
    </div>
  );
}

export default HistoryEntry;