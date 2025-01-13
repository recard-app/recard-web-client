import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';

import './App.scss';
import About from './pages/About';
import Account from './pages/Account';
import SignIn from './pages/SignIn';

import AppHeader from './components/AppHeader';
import PromptWindow from './components/PromptWindow';
import CreditCardSelector from './components/CreditCardSelector';
import Modal from './components/Modal';

function App() {

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
          <a href="/"><h1>ReCard</h1></a>
          <button onClick={handleModalOpen}>Select your Credit Cards</button>
          <a href="/about">About</a>
          <a href="/account">Account</a>
          <a href="/signin">Sign In</a>
        </AppHeader>
        
        <Modal show={modalShow} handleClose={handleModalClose}>
          <CreditCardSelector returnCreditCards={getCreditCards} existingCreditCards={creditCards} />
        </Modal>
        
        <Routes>
          <Route path="/" element={<PromptWindow creditCards={creditCards} />} />
          <Route path="/about" element={<About />} />
          <Route path="/account" element={<Account />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
      </div>
    </Router>
  );

}

export default App;
