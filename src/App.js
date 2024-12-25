import React, { useState, useEffect } from 'react';
import './App.scss';

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
    <div className="app">
      <header className="app-header">
        <button onClick={handleModalOpen}>Select your Credit Cards</button>
        <Modal show={modalShow} handleClose={handleModalClose}>
          <CreditCardSelector returnCreditCards={getCreditCards} existingCreditCards={creditCards} />
        </Modal>
        <PromptWindow creditCards={creditCards} />
      </header>
    </div>
  );
}

export default App;
