import React from 'react';
import CreditCardManager from '../../components/CreditCardManager';

const MyCards = () => {
    return (
        <div>
            <h1>My Cards</h1>
            <p>Set your credit cards to be used for your account.</p>
            <CreditCardManager />
        </div>
    );
};

export default MyCards;
