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
import HelpModal from './components/HelpModal';

function App() {
  const { user, logout } = useAuth();

  const [creditCards, setCreditCards] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [helpModalShow, setHelpModalShow] = useState(false);

  const handleModalOpen = () => {
    setModalShow(true);
  };

  const handleModalClose = () => {
    setModalShow(false);
  };

  const handleHelpModalOpen = () => {
    setHelpModalShow(true);
  };

  const handleHelpModalClose = () => {
    setHelpModalShow(false);
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
        <AppHeader 
          user={user}
          onModalOpen={handleModalOpen}
          onHelpModalOpen={handleHelpModalOpen}
          onLogout={logout}
        />
        
        <Modal show={modalShow} handleClose={handleModalClose}>
          <CreditCardSelector returnCreditCards={getCreditCards} existingCreditCards={creditCards} />
        </Modal>

        <Modal show={helpModalShow} handleClose={handleHelpModalClose}>
          <HelpModal />
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
