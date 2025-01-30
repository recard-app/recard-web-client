import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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

function PromptWindow({ creditCards, user, returnCurrentChatId, onHistoryUpdate }) {
    const { chatId: urlChatId } = useParams();
    const navigate = useNavigate();
    
    const [promptValue, setPromptValue] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [promptSolutions, setPromptSolutions] = useState([]);
    const [chatId, setChatId] = useState('');
    const [isNewChat, setIsNewChat] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSolutions, setIsLoadingSolutions] = useState(false);
    const [errorModalShow, setErrorModalShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [helpModalShow, setHelpModalShow] = useState(false);

    const [isProcessing, setIsProcessing] = useState(false);
    const abortControllerRef = useRef(null);
    const [triggerCall, setTriggerCall] = useState(0);

    const handleErrorModalClose = () => {
        setErrorModalShow(false);
        setErrorMessage('');
    };

    const getPrompt = (returnPrompt) => {
        setPromptValue(returnPrompt);
        setTriggerCall(prev => prev + 1);
    };

    const addChatHistory = (source, message) => {
        const newEntry = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
    }, [triggerCall]);

    useEffect(() => {
        //console.log("Updated chatHistory:", chatHistory);
    }, [chatHistory]);

    useEffect(() => {
        if (chatId && chatId !== urlChatId) {
            returnCurrentChatId(chatId);
            navigate(`/${chatId}`, { replace: true });
        }
    }, [chatId]);

    useEffect(() => {
        const loadChatHistory = async () => {
            if (!user || !urlChatId || urlChatId === chatId) return;

            try {
                const token = await auth.currentUser.getIdToken();
                const response = await axios.get(`${apiurl}/history/get/${urlChatId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                setChatHistory(response.data.conversation);
                setPromptSolutions(response.data.solutions);
                setChatId(urlChatId);
                setIsNewChat(false);
                returnCurrentChatId(urlChatId);
            } catch (error) {
                console.error('Error loading chat:', error);
                setErrorMessage('Error loading chat history');
                setErrorModalShow(true);
            }
        };

        if (user) {
            loadChatHistory();
        }
    }, [urlChatId, user]);

    const callServer = () => {
        setIsProcessing(true);
        setIsLoading(true);
        
        // Create new AbortController for this request
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        const currentDate = getCurrentDateString();
        const name = user?.name || 'Guest';

        const userMessage = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            chatSource: userClient,
            chatMessage: promptValue
        };

        const requestData = {
            name: name,
            prompt: promptValue,
            chatHistory: chatHistory,
            creditCards: creditCards,
            currentDate: currentDate
        };

        axios.post(`${apiurl}/ai/response`, requestData, { signal })
            .then(response => {
                const aiResponse = response.data;
                const updatedHistory = [...chatHistory, userMessage, {
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    chatSource: aiClient,
                    chatMessage: aiResponse
                }];
                
                setIsLoading(false);
                setIsLoadingSolutions(true);
                setChatHistory(updatedHistory);

                return axios.post(`${apiurl}/ai/solutions`, {
                    ...requestData,
                    chatHistory: updatedHistory
                }, { signal }).then(solutionsResponse => ({
                    solutions: solutionsResponse.data,
                    updatedHistory
                }));
            })
            .then(({ solutions, updatedHistory }) => {
                if (signal.aborted) return;
                setPromptSolutions(solutions);
                setIsLoadingSolutions(false);

                if (!user) return;

                return auth.currentUser.getIdToken()
                    .then(token => {
                        const endpoint = isNewChat ? 
                            `${apiurl}/history/add` : 
                            `${apiurl}/history/update/${chatId}`;

                        return axios({
                            method: isNewChat ? 'post' : 'put',
                            url: endpoint,
                            data: {
                                chatHistory: updatedHistory,
                                promptSolutions: solutions,
                            },
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            signal
                        });
                    })
                    .then(response => {
                        if (isNewChat && response?.data?.chatId) {
                            setChatId(response.data.chatId);
                            returnCurrentChatId(response.data.chatId);
                        }
                        onHistoryUpdate();
                    });
            })
            .catch(error => {
                if (axios.isCancel(error)) {
                    console.log('Request cancelled');
                    resetLoading();
                    abortControllerRef.current = null;
                    return;
                }
                console.error(error);
                setErrorMessage('Error processing request, please try again.');
                setErrorModalShow(true);
            })
            .finally(() => {
                resetLoading();
                abortControllerRef.current = null;
            });
    };

    const resetLoading = () => {
        setIsProcessing(false);
        setIsLoading(false);
        setIsLoadingSolutions(false);
    };

    const handleCancel = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        resetLoading();
    };

    const handleNewTransaction = () => {
        setChatHistory([]);
        setPromptSolutions([]);
        setIsNewChat(true);
        setChatId('');
        returnCurrentChatId('');
        navigate('/');
        onHistoryUpdate();
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
            <PromptField 
                returnPrompt={getPrompt} 
                isProcessing={isProcessing} 
                onCancel={handleCancel} 
            />
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