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
const MAX_CHAT_MESSAGES = 20;

const CHAT_HISTORY_MESSAGES = {
    'do_not_track_history': 'Your chat history is not being stored. Messages will vanish when you leave or refresh the page.',
    'keep_month': 'Your chat history is being stored for one month before being automatically cleared.',
    'keep_week': 'Your chat history is being stored for one week before being automatically cleared.'
};

function PromptWindow({ 
    creditCards, 
    userCardDetails,
    user, 
    returnCurrentChatId, 
    onHistoryUpdate, 
    clearChatCallback,
    setClearChatCallback,
    existingHistoryList,
    preferencesInstructions,
    chatHistoryPreference,
    showHistoryPanel
}) {
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
    const [isNewChatPending, setIsNewChatPending] = useState(false);

    const handleErrorModalClose = () => {
        setErrorModalShow(false);
        setErrorMessage('');
    };

    const getPrompt = (returnPrompt) => {
        if (isNewChat && isNewChatPending) {
            console.log('New chat creation in progress, please wait...');
            return;
        }
        setPromptValue(returnPrompt);
        setTriggerCall(prev => prev + 1);
    };

    const addChatHistory = (source, message) => {
        const newEntry = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            chatSource: source,
            chatMessage: message,
        };
    
        setChatHistory((prevChatHistory) => {
            const updatedHistory = [...prevChatHistory, newEntry];
            return limitChatHistory(updatedHistory);
        });
    };

    useEffect(() => {
        if (promptValue !== '') {
            if (isNewChat) {
                setIsNewChatPending(true);
            }
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

            // First check if the chat exists in the existing history
            const existingChat = existingHistoryList.find(chat => chat.chatId === urlChatId);
            
            if (existingChat) {
                setChatHistory(limitChatHistory(existingChat.conversation));
                setPromptSolutions(existingChat.solutions);
                setChatId(urlChatId);
                setIsNewChat(false);
                returnCurrentChatId(urlChatId);
                return;
            }

            // If not found in existing history, fetch from API
            try {
                const token = await auth.currentUser.getIdToken();
                const response = await axios.get(`${apiurl}/history/get/${urlChatId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                setChatHistory(limitChatHistory(response.data.conversation));
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
    }, [urlChatId, user, existingHistoryList]);

    useEffect(() => {
        if (clearChatCallback > 0) {
            handleNewTransaction();
            setClearChatCallback(0);
        }
    }, [clearChatCallback, setClearChatCallback]);

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

        // Filter out unselected cards
        const selectedCreditCards = creditCards.filter(card => card.selected);

        const requestData = {
            name: name,
            prompt: promptValue,
            chatHistory: limitChatHistory(chatHistory),
            creditCards: selectedCreditCards,
            currentDate: currentDate,
            preferencesInstructions: preferencesInstructions
        };

        // Only add userCardDetails if user is authenticated
        if (user && userCardDetails?.length > 0) {
            requestData.userCardDetails = userCardDetails;
        }

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
                setChatHistory(limitChatHistory(updatedHistory));

                return axios.post(`${apiurl}/ai/solutions`, {
                    ...requestData,
                    chatHistory: limitChatHistory(updatedHistory)
                }, { signal }).then(solutionsResponse => ({
                    solutions: solutionsResponse.data,
                    updatedHistory
                }));
            })
            .then(({ solutions, updatedHistory }) => {
                if (signal.aborted) return;
                setPromptSolutions(solutions);
                setIsLoadingSolutions(false);

                // Handle local state updates regardless of history preference
                setChatHistory(limitChatHistory(updatedHistory));

                // Only proceed with server-side history storage if tracking is enabled
                if (!user || chatHistoryPreference === 'do_not_track_history') {
                    setIsNewChatPending(false);  // Make sure to reset the pending state
                    return;
                }

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
                                chatHistoryPreference: chatHistoryPreference
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
                            const newChat = {
                                chatId: response.data.chatId,
                                timestamp: new Date().toISOString(),
                                conversation: updatedHistory,
                                solutions: solutions,
                                chatDescription: response.data.chatDescription || 'New Chat'
                            };
                            onHistoryUpdate(newChat);
                            setChatId(response.data.chatId);
                            returnCurrentChatId(response.data.chatId);
                            setIsNewChat(false);
                            setIsNewChatPending(false);
                        } else {
                            // Update existing chat
                            const updatedChat = {
                                chatId: chatId,
                                timestamp: new Date().toISOString(),
                                conversation: updatedHistory,
                                solutions: solutions,
                            };
                            onHistoryUpdate(updatedChat);
                        }
                    });
            })
            .catch(error => {
                if (axios.isCancel(error)) {
                    console.log('Request cancelled');
                    setIsNewChatPending(false);
                    resetLoading();
                    abortControllerRef.current = null;
                    return;
                }
                console.error(error);
                setIsNewChatPending(false);
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
        setIsNewChatPending(false);
        setChatId('');
        returnCurrentChatId('');
        navigate('/');
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
            {chatHistory.length >= MAX_CHAT_MESSAGES && (
                <div className="below-prompt-field-text">
                    Remember to <button onClick={handleNewTransaction} className="inline-button">create a new transaction chat</button> for best results.
                </div>
            )}
            {CHAT_HISTORY_MESSAGES[chatHistoryPreference] && (
                <div className="below-prompt-field-text">
                    {CHAT_HISTORY_MESSAGES[chatHistoryPreference]}
                </div>
            )}
        </div>
    );
}

export default PromptWindow;


const limitChatHistory = (chatHistory) => {
    return Array.isArray(chatHistory) ? chatHistory.slice(-MAX_CHAT_MESSAGES) : [];
};

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