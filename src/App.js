import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Styles
import './App.scss';

// Pages
import About from './pages/About';
import Account from './pages/Account';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

// Components
import AppHeader from './components/AppHeader';
import PromptWindow from './components/PromptWindow';
import CreditCardSelector from './components/CreditCardSelector';
import Modal from './components/Modal';
import ProtectedRoute from './context/ProtectedRoute';

// Context
import { useAuth } from './context/AuthContext';

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
        <AppHeader 
          user={user}
          onModalOpen={handleModalOpen}
          onLogout={logout}
        />
        
        <Modal show={modalShow} handleClose={handleModalClose}>
          <CreditCardSelector returnCreditCards={getCreditCards} existingCreditCards={creditCards} />
        </Modal>
        
        <Routes>
          <Route path="/" element={<PromptWindow creditCards={creditCards} user={user} />} />
          <Route path="/about" element={<About />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
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
