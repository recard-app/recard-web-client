import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';

// Styles
import './App.scss';

// Pages
import About from './pages/About';
import Account from './pages/Account';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Welcome from './pages/Welcome';
import Preferences from './pages/Preferences';
// Components
import AppHeader from './components/AppHeader';
import HistoryPanel from './components/HistoryPanel';
import PromptWindow from './components/PromptWindow';
import CreditCardSelector from './components/CreditCardSelector';
import Modal from './components/Modal';
import ProtectedRoute from './context/ProtectedRoute';
import RedirectIfAuthenticated from './context/RedirectIfAuthenticated';

// Context
import { useAuth } from './context/AuthContext';

function AppContent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [creditCards, setCreditCards] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const handleModalOpen = () => {
    setModalShow(true);
  };

  const handleModalClose = () => {
    setModalShow(false);
  };

  const getCreditCards = (returnCreditCards) => {
    setCreditCards(returnCreditCards);
  };

  const getHistoryList = (returnHistoryList) => {
    setChatHistory(returnHistoryList);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  useEffect(() => {
    //console.log(creditCards);
  }, [creditCards]);

  useEffect(() => {
    //console.log(chatHistory);
  }, [chatHistory]);

  return (
    <div className="app">
      <AppHeader 
        user={user}
        onModalOpen={handleModalOpen}
        onLogout={handleLogout}
      />
      
      <Modal show={modalShow} handleClose={handleModalClose}>
        <CreditCardSelector returnCreditCards={getCreditCards} existingCreditCards={creditCards} />
      </Modal>
      
      <Routes>
        <Route path="/" element={
          <div className="app-content">
            <HistoryPanel returnHistoryList={getHistoryList} existingHistoryList={chatHistory} />
            <PromptWindow creditCards={creditCards} user={user} />
          </div>
        } />
        <Route path="/about" element={<About />} />
        <Route path="/preferences" element={
          <ProtectedRoute>
            <Preferences onModalOpen={handleModalOpen} />
          </ProtectedRoute>
        } />
        <Route path="/signin" element={
          <RedirectIfAuthenticated>
            <SignIn />
          </RedirectIfAuthenticated>
        } />
        <Route path="/signup" element={
          <RedirectIfAuthenticated>
            <SignUp />
          </RedirectIfAuthenticated>
        } />
        <Route path="/welcome" element={
          <ProtectedRoute>
            <Welcome onModalOpen={handleModalOpen} />
          </ProtectedRoute>
        } />
        <Route path="/account" element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
