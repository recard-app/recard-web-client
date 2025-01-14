import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

import './App.scss';
import About from './pages/About';
import Account from './pages/Account';
import SignIn from './pages/SignIn';

import AppHeader from './components/AppHeader';
import PromptWindow from './components/PromptWindow';
import CreditCardSelector from './components/CreditCardSelector';
import Modal from './components/Modal';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user, logout } = useAuth();

  const [creditCards, setCreditCards] = useState([]);
  const [modalShow, setModalShow] = useState(false);

  const handleModalOpen = () => {
    setModalShow(true);
  };

  const handleModalClose = () => {
    setModalShow(false);
  };

  const getCreditCards = (returnCreditCards) => {
    setCreditCards(returnCreditCards);
  };

  useEffect(() => {
    //console.log(creditCards);
  }, [creditCards]);

  return (
    <Router>
      <div className="app">
        <AppHeader>
          <Link to="/"><h1>ReCard</h1></Link>
          <button onClick={handleModalOpen}>Select your Credit Cards</button>
          <Link to="/about">About</Link>
          {user ? (
            <>
              <Link to="/account">Account</Link>
              {user.picture && (
                <img 
                  src={user.picture} 
                  alt="Profile" 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%',
                    marginLeft: '10px',
                    marginRight: '10px'
                  }} 
                />
              )}
              <button onClick={logout}>Sign Out</button>
            </>
          ) : (
            <Link to="/signin">Sign In</Link>
          )}
        </AppHeader>
        
        <Modal show={modalShow} handleClose={handleModalClose}>
          <CreditCardSelector returnCreditCards={getCreditCards} existingCreditCards={creditCards} />
        </Modal>
        
        <Routes>
          <Route path="/" element={<PromptWindow creditCards={creditCards} user={user} />} />
          <Route path="/about" element={<About />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/account" element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
