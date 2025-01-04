import React, { useState, useEffect } from 'react';

import PromptHistory from './PromptHistory';
import PromptField from './PromptField';
import PromptSolution from './PromptSolution';

import axios from 'axios';

const apiurl = 'http://localhost:8000';
const aiClient = 'assistant';
const userClient = 'user';

function PromptWindow({ creditCards }) {
    const [promptValue, setPromptValue] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [promptSolutions, setPromptSolutions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSolutions, setIsLoadingSolutions] = useState(false);

    const getPrompt = (returnPrompt) => {
        setPromptValue(returnPrompt);
    };

    const addChatHistory = (source, message) => {
        const newEntry = {
          id: Date.now(),
          chatSource: source,
          chatMessage: message,
        };
    
        setChatHistory((prevChatHistory) => [...prevChatHistory, newEntry]);
        //console.log("Successful history logged:", newEntry);
    };

    useEffect(() => {
        if (promptValue !== '') {
            addChatHistory(userClient, promptValue);
            callServer();
        }
    }, [promptValue]);

    useEffect(() => {
        //console.log("Updated chatHistory:", chatHistory);
    }, [chatHistory]);

    const callServer = () => {
        setIsLoading(true);
        const currentDate = getCurrentDateString();
        const requestData = {
            name: 'Evan',
            prompt: promptValue,
            chatHistory: chatHistory, 
            creditCards: creditCards, 
            currentDate: currentDate
        };
        
        axios.post(`${apiurl}/ai-response`, requestData, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                addChatHistory(aiClient, response.data);
                setIsLoading(false);
                // Start solutions loading
                setIsLoadingSolutions(true);
                return axios.post(`${apiurl}/ai-solutions`, {
                    name: 'Evan',
                    prompt: promptValue,
                    chatHistory: chatHistory,
                    creditCards: creditCards,
                    currentDate: currentDate
                });
            })
            .then(solutionsResponse => {
                setPromptSolutions(solutionsResponse.data);
                setIsLoadingSolutions(false);
            })
            .catch(error => {
                console.log(error);
                setIsLoading(false);
                setIsLoadingSolutions(false);
            });
    };

    return (
        <div className='prompt-window'>
            <PromptHistory chatHistory={chatHistory} />
            {isLoading && <div className="loading-indicator">...</div>}
            {isLoadingSolutions && <div className="loading-indicator">Looking for Card Recommendations...</div>}
            <PromptSolution promptSolutions={promptSolutions} />
            <PromptField returnPrompt={getPrompt} />
        </div>
    );
}

export default PromptWindow;




const getCurrentDateString = () => {
    const now = new Date();
  
    // Format the date components
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(now.getDate()).padStart(2, '0');
  
    // Format the time components
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
  
    // Combine into a single string
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };