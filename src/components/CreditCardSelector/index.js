import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CreditCardSelector.scss';
import { auth } from '../../config/firebase';
const apiurl = process.env.REACT_APP_BASE_URL;

function CreditCardSelector({ returnCreditCards, existingCreditCards }) {

    const [creditCards, setCreditCards] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [saveStatus, setSaveStatus] = useState('');

    const sortCards = (cards) => {
        return [...cards].sort((a, b) => {
            // Sort by selected status first
            if (a.selected !== b.selected) {
                return b.selected ? 1 : -1;
            }
            // If selection status is same, sort by ID
            return a.id - b.id;
        });
    };

    useEffect(() => {
        if (existingCreditCards.length === 0) {
            axios.get(`${apiurl}/cards/full-list`)
            .then(response => {
                setCreditCards(sortCards(response.data));
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
        } else {
            setCreditCards(sortCards(existingCreditCards));
        }
    }, []);
    
    useEffect(() => {
        //console.log(creditCards);
        returnCreditCards(creditCards);
    }, [creditCards]);

    const handleCheckboxChange = (index) => {
        const updatedCardList = [...creditCards];
        updatedCardList[index].selected = !updatedCardList[index].selected;
        setCreditCards(updatedCardList);
    };

    const filteredCards = creditCards
        .filter(card => 
            card.cardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.cardType.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const handleSave = async () => {
        const selectedCardIds = creditCards
            .filter(card => card.selected)
            .map(card => card.id);
        
        console.log('Selected card IDs being sent:', selectedCardIds);
        
        try {
            // Get fresh Firebase token from the current user
            const token = await auth.currentUser.getIdToken();
            const response = await axios.post(`${apiurl}/cards/update_cards`, 
                { cardIds: selectedCardIds },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            console.log('Response from server:', response.data);
            setCreditCards(sortCards(response.data));
            setSaveStatus('Cards saved successfully!');
        } catch (error) {
            console.error('Error saving cards:', error);
            setSaveStatus('Error saving cards. Please try again.');
        }
    };

    return (
        <div className='credit-card-selector'>
            <h3>Select your Credit Cards</h3>
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search cards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>
            {filteredCards.map((card, index) => (
                <div key={index} className='card'>
                    <label className='card-select' htmlFor={card.id}>
                        <input 
                            type="checkbox" 
                            id={card.id}
                            name={card.cardName} 
                            value={card.cardName} 
                            checked={card.selected} 
                            onChange={() => handleCheckboxChange(index)}
                        />
                        <img src='/credit-card-128.png' alt='Credit Card Img' />
                        <div className='card-desc'>
                            <p className='card-name'>{card.cardName}</p>
                            <p className='card-type'>{card.cardType}</p>
                        </div>
                    </label>
                </div>
            ))}
            <div className="save-section">
                <button onClick={handleSave} className="save-button">
                    Save
                </button>
                {saveStatus && <p className="save-status">{saveStatus}</p>}
            </div>
        </div>
    );

}

export default CreditCardSelector;