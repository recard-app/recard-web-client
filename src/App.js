import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { auth } from './config/firebase';

// Styles
import './App.scss';

// Pages
import About from './pages/About';
import Account from './pages/Account';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Welcome from './pages/Welcome';
import Preferences from './pages/Preferences';
import History from './pages/History';
import ForgotPassword from './pages/ForgotPassword';
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

const apiurl = process.env.REACT_APP_BASE_URL;
const quick_history_size = 3;

function AppContent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [creditCards, setCreditCards] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  useEffect(() => {
    setCurrentChatId(null);
  }, [user]);

  useEffect(() => {
    if (location.pathname === '/' && currentChatId) {
      navigate(`/${currentChatId}`, { replace: true });
    }
  }, [location.pathname, currentChatId, navigate]);

  useEffect(() => {
    const fetchCreditCards = async () => {
      if (!user) return;
      
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await axios.get(`${apiurl}/cards/full-list`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setCreditCards(response.data);
      } catch (error) {
        console.error('Error fetching credit cards:', error);
      }
    };

    fetchCreditCards();
  }, [user]);

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

  const getCurrentChatId = (returnCurrentChatId) => {
    setCurrentChatId(returnCurrentChatId || null);
  };

  const handleLogout = async () => {
    setCurrentChatId(null);
    await logout();
    navigate('/signin');
  };

  const handleHistoryUpdate = () => {
    setHistoryRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    //console.log(creditCards);
  }, [creditCards]);

  useEffect(() => {
    console.log(chatHistory);
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
            <HistoryPanel 
              returnHistoryList={getHistoryList} 
              existingHistoryList={chatHistory} 
              fullListSize={false} 
              listSize={quick_history_size}
              refreshTrigger={historyRefreshTrigger} 
              currentChatId={currentChatId}
              returnCurrentChatId={getCurrentChatId}
            />
            <PromptWindow 
              creditCards={creditCards} 
              user={user} 
              returnCurrentChatId={getCurrentChatId}
              onHistoryUpdate={handleHistoryUpdate}
            />
          </div>
        } />
        <Route path="/:chatId" element={
          <div className="app-content">
            <HistoryPanel 
              returnHistoryList={getHistoryList} 
              existingHistoryList={chatHistory} 
              fullListSize={false} 
              listSize={quick_history_size}
              refreshTrigger={historyRefreshTrigger}
              currentChatId={currentChatId}
              returnCurrentChatId={getCurrentChatId}
            />
            <PromptWindow 
              creditCards={creditCards} 
              user={user} 
              returnCurrentChatId={getCurrentChatId}
              onHistoryUpdate={handleHistoryUpdate}
            />
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
        <Route path="/forgotpassword" element={
            <RedirectIfAuthenticated>
                <ForgotPassword />
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
        <Route path="/history" element={
          <History 
            returnHistoryList={getHistoryList}
            existingHistoryList={chatHistory}
            currentChatId={currentChatId}
            refreshTrigger={historyRefreshTrigger}
          />
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
