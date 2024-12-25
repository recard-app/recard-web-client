import React, { useState, useEffect } from 'react';
import axios from 'axios';

const apiurl = 'http://localhost:8000';

function CreditCardSelector({ returnCreditCards, existingCreditCards }) {

    const [creditCards, setCreditCards] = useState([]);

    useEffect(() => {
        if (existingCreditCards.length === 0) {
            axios.get(`${apiurl}/credit-card-list`)
            .then(response => {
                setCreditCards(response.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
        } else {
            setCreditCards(existingCreditCards);
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

    return (
        <div className='credit-card-selector'>
            <h3>Select your Credit Cards</h3>
            {creditCards.map((card, index) => (
                <div key={index} className='card'>
                    <label className='card-select' htmlFor={`card-${index}`}>
                        <input 
                            type="checkbox" 
                            id={`card-${index}`} 
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
        </div>
    );

}

export default CreditCardSelector;