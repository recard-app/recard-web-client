import React from 'react';

const AppHeader = ({ children }) => {
  return (
    <header className="app-header">
        <h1>ReCard</h1>
        {children}
    </header>
  );
};

export default AppHeader;
