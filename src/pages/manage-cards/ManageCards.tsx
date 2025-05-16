import React from 'react';
import CreditCardManager from '../../components/CreditCardManager';

const ManageCards = () => {
    return (
        <div>
            <h1>Manage Your Cards</h1>
            <p>Set your credit cards to be used for your account.</p>
            <CreditCardManager />
        </div>
    );
};

export default ManageCards;
