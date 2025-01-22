import React, { useState, useEffect } from 'react';

import PromptHistory from './PromptHistory';
import PromptField from './PromptField';
import PromptSolution from './PromptSolution';
import PromptHelpModal from './PromptHelpModal';
import Modal from '../Modal';
import './PromptWindow.scss';

import axios from 'axios';
import { auth } from '../../config/firebase';

const apiurl = process.env.REACT_APP_BASE_URL;
const aiClient = 'assistant';
const userClient = 'user';

function PromptWindow({ creditCards, user }) {
    const [promptValue, setPromptValue] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [promptSolutions, setPromptSolutions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSolutions, setIsLoadingSolutions] = useState(false);
    const [errorModalShow, setErrorModalShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [helpModalShow, setHelpModalShow] = useState(false);

    const handleErrorModalClose = () => {
        setErrorModalShow(false);
        setErrorMessage('');
    };

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
        const name = user?.name || 'Guest';

        const requestData = {
            name: name,
            prompt: promptValue,
            chatHistory: chatHistory, 
            creditCards: creditCards, 
            currentDate: currentDate
        };
        
        axios.post(`${apiurl}/ai/response`, requestData, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                addChatHistory(aiClient, response.data);
                setIsLoading(false);
                // Start solutions loading
                setIsLoadingSolutions(true);
                return axios.post(`${apiurl}/ai/solutions`, {
                    name: name,
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

    const handleNewTransaction = () => {
        // Only save chat history if user is logged in and there's history to save
        if (user && chatHistory.length > 0) {
            // Get fresh Firebase token from the current user
            auth.currentUser.getIdToken().then(token => {
                axios.post(`${apiurl}/history/add`, {
                    chatHistory: chatHistory,
                    promptSolutions: promptSolutions,
                    timestamp: getCurrentDateString()
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                .then(() => {
                    // Only clear the states after successful API call
                    setChatHistory([]);
                    setPromptSolutions([]);
                })
                .catch(error => {
                    console.error('Error saving chat history:', error);
                    setErrorMessage('Error creating new chat, please try again.');
                    setErrorModalShow(true);
                });
            });
        } else {
            // If user is not logged in, just clear the states
            setChatHistory([]);
            setPromptSolutions([]);
        }
    };

    const handleHelpModalOpen = () => {
        setHelpModalShow(true);
    };

    const handleHelpModalClose = () => {
        setHelpModalShow(false);
    };

    return (
        <div className='prompt-window'>
            <div className="prompt-window-header">
                <button onClick={handleNewTransaction}>New Transaction Chat</button>
                <button onClick={handleHelpModalOpen}>Help</button>
            </div>
            
            <Modal show={errorModalShow} handleClose={handleErrorModalClose}>
                <div>{errorMessage}</div>
            </Modal>

            <Modal show={helpModalShow} handleClose={handleHelpModalClose}>
                <PromptHelpModal />
            </Modal>

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