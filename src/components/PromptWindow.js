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
    const [responseValue, setResponseValue] = useState('');
    const [chatHistory, setChatHistory] = useState([]);

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
        const requestData = {
            name: 'Evan',
            prompt: promptValue,
            chatHistory: chatHistory, 
            creditCards: creditCards
        };
        
        axios.post(`${apiurl}/ai-response`, requestData, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                setResponseValue(response.data);
                addChatHistory(aiClient, response.data);
            })
            .catch(error => {
                console.log(error);
            });
    };

    const checkSolution = () => {

    }

    return (
        <div className='prompt-window'>
            <h3>ReCard (Rewards Card)</h3>
            <PromptHistory chatHistory={chatHistory} />
            <PromptSolution />
            <PromptField returnPrompt={getPrompt} />
        </div>
    );

}

export default PromptWindow;