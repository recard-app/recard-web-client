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
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState(null);

  const [clearChatCallback, setClearChatCallback] = useState(0);
  const [preferencesInstructions, setPreferencesInstructions] = useState('');

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

  useEffect(() => {
    const fetchPreferencesInstructions = async () => {
      if (!user) return;
      
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await axios.get(`${apiurl}/user/preferences_instructions`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setPreferencesInstructions(response.data.instructions);
      } catch (error) {
        console.error('Error fetching preferences instructions:', error);
      }
    };

    fetchPreferencesInstructions();
  }, [user]);

  useEffect(() => {
    const fetchFullHistory = async () => {
      if (!user) return;
      
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await axios.get(`${apiurl}/history/get_full_list`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            lastUpdate: lastUpdateTimestamp
          }
        });
        
        if (response.data.hasUpdates) {
          // Ensure each chat history entry has all required fields
          const processedHistory = response.data.chatHistory.map(chat => ({
            chatId: chat.chatId,
            timestamp: chat.timestamp,
            chatDescription: chat.chatDescription,
            conversation: chat.conversation,
            solutions: chat.solutions
          }));
          
          setChatHistory(processedHistory);
          setLastUpdateTimestamp(new Date().toISOString());
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchFullHistory();
    console.log("full chat history fetched");
  }, [user, historyRefreshTrigger]);

  const handleModalOpen = () => {
    setModalShow(true);
  };

  const handleModalClose = () => {
    setModalShow(false);
  };

  const getCreditCards = (returnCreditCards) => {
    setCreditCards(returnCreditCards);
  };

  const getCurrentChatId = (returnCurrentChatId) => {
    setCurrentChatId(returnCurrentChatId || null);
  };

  const handleLogout = async () => {
    setCurrentChatId(null);
    await logout();
    navigate('/signin');
  };

  const handleHistoryUpdate = async (updatedChat) => {
    // Return early if updatedChat is undefined
    if (!updatedChat) return;

    // If updatedChat is a function, it's a delete operation
    if (typeof updatedChat === 'function') {
      setChatHistory(updatedChat);  // Apply the filter function directly
      handleClearChat();
    } else {
      // Handle normal chat updates
      setChatHistory(prevHistory => {
        const newHistory = [...prevHistory];
        const existingIndex = newHistory.findIndex(chat => chat.chatId === updatedChat.chatId);

        if (existingIndex !== -1) {
          newHistory[existingIndex] = {
            ...updatedChat,
            chatDescription: updatedChat.chatDescription || newHistory[existingIndex].chatDescription,
          };
        } else {
          newHistory.unshift(updatedChat);
        }

        return newHistory;
      });
    }

    setLastUpdateTimestamp(new Date().toISOString());
    setHistoryRefreshTrigger(prev => prev + 1);
  };

  const handleClearChat = () => {
    // Increment the callback counter to trigger a clear
    setClearChatCallback(prev => prev + 1);
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
            <HistoryPanel 
              existingHistoryList={chatHistory} 
              fullListSize={false} 
              listSize={quick_history_size}
              currentChatId={currentChatId}
              returnCurrentChatId={getCurrentChatId}
              onHistoryUpdate={handleHistoryUpdate}
            />
            <PromptWindow 
              creditCards={creditCards} 
              user={user} 
              returnCurrentChatId={getCurrentChatId}
              onHistoryUpdate={handleHistoryUpdate}
              clearChatCallback={clearChatCallback}
              setClearChatCallback={setClearChatCallback}
              existingHistoryList={chatHistory}
              preferencesInstructions={preferencesInstructions}
            />
          </div>
        } />
        <Route path="/:chatId" element={
          <div className="app-content">
            <HistoryPanel 
              existingHistoryList={chatHistory} 
              fullListSize={false} 
              listSize={quick_history_size}
              currentChatId={currentChatId}
              returnCurrentChatId={getCurrentChatId}
              onHistoryUpdate={handleHistoryUpdate}
            />
            <PromptWindow 
              creditCards={creditCards} 
              user={user} 
              returnCurrentChatId={getCurrentChatId}
              onHistoryUpdate={handleHistoryUpdate}
              clearChatCallback={clearChatCallback}
              setClearChatCallback={setClearChatCallback}
              existingHistoryList={chatHistory}
              preferencesInstructions={preferencesInstructions}
            />
          </div>
        } />
        <Route path="/about" element={<About />} />
        <Route path="/preferences" element={
          <ProtectedRoute>
            <Preferences 
              onModalOpen={handleModalOpen} 
              preferencesInstructions={preferencesInstructions}
              setPreferencesInstructions={setPreferencesInstructions}
            />
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
            existingHistoryList={chatHistory}
            currentChatId={currentChatId}
            returnCurrentChatId={getCurrentChatId}
            onHistoryUpdate={handleHistoryUpdate}
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
