import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';

import PromptHistory from './PromptHistory';
import PromptField from './PromptField';
import PromptSolution from './PromptSolution';
import PromptHelpModal from './PromptHelpModal';
import { Modal, useModal } from '../Modal';
import './PromptWindow.scss';

import axios from 'axios';
import { auth } from '../../config/firebase';

// Import types
import { CreditCard } from '../../types/CreditCardTypes';
import { ChatMessage, ChatSolution, Conversation, ChatRequestData } from '../../types/ChatTypes';
import { ChatHistoryPreference, InstructionsPreference } from '../../types/UserTypes';
import { CHAT_SOURCE, CHAT_HISTORY_PREFERENCE, ChatHistoryPreferenceType, RECOMMENDED_MAX_CHAT_MESSAGES } from '../../types';
import { UserHistoryService } from '../../services';

const apiurl = import.meta.env.VITE_BASE_URL;

const aiClient = CHAT_SOURCE.ASSISTANT;
const userClient = CHAT_SOURCE.USER;
const MAX_CHAT_MESSAGES = RECOMMENDED_MAX_CHAT_MESSAGES;
const DEFAULT_CHAT_NAME = 'New Transaction Chat';

const CHAT_HISTORY_MESSAGES: Record<ChatHistoryPreferenceType, string> = {
    [CHAT_HISTORY_PREFERENCE.DO_NOT_TRACK_HISTORY]: 'Your chat history is not being stored. Messages will vanish when you leave or refresh the page.',
    [CHAT_HISTORY_PREFERENCE.KEEP_HISTORY]: ''
};

/**
 * Props for the PromptWindow component.
 * @param {CreditCard[]} creditCards - An array of credit cards.
 * @param {string[]} userCardDetails - An array of user card details.
 * @param {FirebaseUser | null} user - The current user.
 * @param {function} returnCurrentChatId - A function to return the current chat ID.
 * @param {function} onHistoryUpdate - A function to update the history.
 * @param {number} clearChatCallback - A callback to clear the chat.
 * @param {function} setClearChatCallback - A function to set the clear chat callback.
 * @param {Conversation[]} existingHistoryList - An array of existing history.
 * @param {string} preferencesInstructions - The preferences instructions.
 * @param {ChatHistoryPreference} chatHistoryPreference - The chat history preference.
 * @param {boolean} showHistoryPanel - Whether to show the history panel.
 */
interface PromptWindowProps {
    creditCards: CreditCard[];
    userCardDetails: string[];
    user: FirebaseUser | null;
    returnCurrentChatId: (chatId: string) => void;
    onHistoryUpdate: (chat: Conversation) => void;
    clearChatCallback: number;
    setClearChatCallback: (value: number) => void;
    existingHistoryList: Conversation[];
    preferencesInstructions: InstructionsPreference;
    chatHistoryPreference: ChatHistoryPreference;
    showHistoryPanel: boolean;
}

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
}: PromptWindowProps) {
    const { chatId: urlChatId } = useParams<{ chatId: string }>();
    const navigate = useNavigate();
    
    const [promptValue, setPromptValue] = useState<string>('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [promptSolutions, setPromptSolutions] = useState<ChatSolution>([]);
    const [chatId, setChatId] = useState<string>('');
    const [isNewChat, setIsNewChat] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingSolutions, setIsLoadingSolutions] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [triggerCall, setTriggerCall] = useState<number>(0);
    const [isNewChatPending, setIsNewChatPending] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const errorModal = useModal();
    const helpModal = useModal();

    const handleErrorModalClose = () => {
        errorModal.close();
        setErrorMessage('');
    };

    const getPrompt = (returnPrompt: string) => {
        if (isNewChat && isNewChatPending) {
            console.log('New chat creation in progress, please wait...');
            return;
        }
        setPromptValue(returnPrompt);
        setTriggerCall(prev => prev + 1);
    };

    const addChatHistory = (source: typeof userClient | typeof aiClient, message: string): void => {
        const newEntry: ChatMessage = {
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
                const response = await UserHistoryService.fetchChatHistoryById(urlChatId);
                
                setChatHistory(limitChatHistory(response.conversation));
                setPromptSolutions(response.solutions);
                setChatId(urlChatId);
                setIsNewChat(false);
                returnCurrentChatId(urlChatId);
            } catch (error) {
                console.error('Error loading chat:', error);
                setErrorMessage('Error loading chat history');
                errorModal.open();
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

    const callServer = async (): Promise<void> => {
        setIsProcessing(true);
        setIsLoading(true);
        
        // Create new AbortController for this request
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        const currentDate = getCurrentDateString();
        const name = user?.displayName || 'Guest';

        const userMessage: ChatMessage = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            chatSource: userClient,
            chatMessage: promptValue
        };

        // Filter out unselected cards
        const selectedCreditCards = creditCards.filter(card => card.selected);

        const requestData: ChatRequestData = {
            name,
            prompt: promptValue,
            chatHistory: limitChatHistory(chatHistory),
            creditCards: selectedCreditCards,
            currentDate,
            preferencesInstructions
        };

        // Only add userCardDetails if user is authenticated
        if (user && userCardDetails?.length > 0) {
            requestData.userCardDetails = userCardDetails;
        }

        axios.post(`${apiurl}/chat/response`, requestData, { signal })
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

                return axios.post(`${apiurl}/chat/solution`, {
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
                if (!user || chatHistoryPreference === CHAT_HISTORY_PREFERENCE.DO_NOT_TRACK_HISTORY) {
                    setIsNewChatPending(false);  // Make sure to reset the pending state
                    return;
                }

                return auth.currentUser.getIdToken()
                    .then(token => {
                        const endpoint = isNewChat ? 
                            `${apiurl}/users/history` : 
                            `${apiurl}/users/history/${chatId}`;

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
                                chatDescription: response.data.chatDescription || DEFAULT_CHAT_NAME
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
                                chatDescription: response.data.chatDescription || existingHistoryList.find(chat => chat.chatId === chatId)?.chatDescription || DEFAULT_CHAT_NAME
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
                errorModal.open();
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

    const handleHelpModalOpen = helpModal.open;
    const handleHelpModalClose = helpModal.close;

    return (
        <div className='prompt-window'>
            <div className="prompt-window-header">
                <button onClick={handleNewTransaction}>New Transaction Chat</button>
                <button onClick={handleHelpModalOpen}>Help</button>
            </div>
            
            <Modal isOpen={errorModal.isOpen} onClose={handleErrorModalClose}>
                <div className="error-content">
                    {errorMessage}
                </div>
            </Modal>

            <Modal isOpen={helpModal.isOpen} onClose={handleHelpModalClose}>
                <PromptHelpModal />
            </Modal>

            <PromptHistory chatHistory={chatHistory} />
            {isLoading && <div className="loading-indicator">...</div>}
            {isLoadingSolutions && <div className="loading-indicator">Looking for Card Recommendations...</div>}
            <PromptSolution promptSolutions={promptSolutions} creditCards={creditCards} />
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


const limitChatHistory = (chatHistory: ChatMessage[]): ChatMessage[] => {
    return Array.isArray(chatHistory) ? chatHistory.slice(-MAX_CHAT_MESSAGES) : [];
};

const getCurrentDateString = (): string => {
    const now = new Date();
  
    // Format the date components
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
  
    // Format the time components
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
  
    // Combine into a single string
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};