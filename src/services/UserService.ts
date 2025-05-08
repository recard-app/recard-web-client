import axios from 'axios';
import { apiurl, getAuthHeaders } from './index';
import { 
    Conversation, 
    StartDateResponse, 
    HistoryParams, 
    PagedHistoryResponse,
    ChatMessage,
    ChatSolution,
    CardDetailsList 
} from '../types';
import { ChatHistoryPreference, InstructionsPreference, PreferencesResponse, SubscriptionPlan } from '../types/UserTypes';

export const UserService = {
    /**
     * Fetches user's subscription plan
     * @returns Promise containing the user's subscription plan
     */
    async fetchUserSubscriptionPlan(): Promise<SubscriptionPlan> {
        const headers = await getAuthHeaders();
        const response = await axios.get<SubscriptionPlan>(
            `${apiurl}/users/subscription/plan`,
            { headers }
        );
        return response.data;
    }
};

/**
 * Service class for user-related Credit Card API operations
 */
export const UserCreditCardService = {
    /**
     * Updates user's selected credit cards
     */
    async updateUserCards(selectedCards: { cardId: string; isDefaultCard: boolean }[]): Promise<void> {
        const headers = await getAuthHeaders();
        await axios.post(
            `${apiurl}/users/cards/update`,
            { returnCreditCards: selectedCards },
            { headers }
        );
    },

    /**
     * Fetches user's credit card details
     * @returns Promise containing the user's card details
     */
    async fetchUserCardDetails(): Promise<CardDetailsList> {
        const headers = await getAuthHeaders();
        const response = await axios.get<CardDetailsList>(
            `${apiurl}/users/cards/details`,
            { headers }
        );
        return response.data;
    }
};

/**
 * Service class for user history-related operations
 */
export const UserHistoryService = {
    /**
     * Deletes History Entry
     * @param chatId ID of the chat to delete
     */
    async deleteHistoryEntry(chatId: string): Promise<void> {
        const headers = await getAuthHeaders();
        await axios.delete(`${apiurl}/users/history/${chatId}`, { headers });
    },

    /**
     * Fetches paginated history entries
     * @param params Pagination and filter parameters
     * @returns Paginated history data with update status
     */
    async fetchPagedHistory(params: HistoryParams): Promise<PagedHistoryResponse> {
        const headers = await getAuthHeaders();
        const response = await axios.get<PagedHistoryResponse>(
            `${apiurl}/users/history`,
            { headers, params }
        );
        return response.data;
    },

    /**
     * Fetches the date of the first history entry
     * @returns Response containing the first entry date
     */
    async fetchFirstEntryDate(): Promise<StartDateResponse> {
        const headers = await getAuthHeaders();
        const response = await axios.get<StartDateResponse>(
            `${apiurl}/users/history/start_date`,
            { headers }
        );
        return response.data;
    },

    /**
     * Deletes all chat history for the current user
     * @returns Promise<void>
     */
    async deleteAllHistory(): Promise<void> {
        const headers = await getAuthHeaders();
        const response = await axios.delete(`${apiurl}/users/history/all`, { headers });
        
        if (response.status !== 200) {
            throw new Error('Failed to delete chat history');
        }
    },

    /**
     * Fetches a specific chat history entry by ID
     * @param chatId ID of the chat to fetch
     * @returns Promise containing the conversation data
     */
    async fetchChatHistoryById(chatId: string): Promise<Conversation> {
        const headers = await getAuthHeaders();
        const response = await axios.get<Conversation>(
            `${apiurl}/users/history/${chatId}`,
            { headers }
        );
        return response.data;
    },

    /**
     * Creates a new chat history entry
     * @param chatHistory Array of chat messages
     * @param promptSolutions Array of solutions
     * @param signal Optional AbortController signal
     * @returns Promise containing the created conversation
     */
    async createChatHistory(
        chatHistory: ChatMessage[],
        promptSolutions: ChatSolution,
        signal?: AbortSignal
    ): Promise<Conversation> {
        const headers = await getAuthHeaders();
        const response = await axios.post<Conversation>(
            `${apiurl}/users/history`,
            { chatHistory, promptSolutions },
            { headers, signal }
        );
        return response.data;
    },

    /**
     * Updates an existing chat history entry
     * @param chatId ID of the chat to update
     * @param chatHistory Updated array of chat messages
     * @param promptSolutions Updated array of solutions
     * @param signal Optional AbortController signal
     * @returns Promise<void>
     */
    async updateChatHistory(
        chatId: string,
        chatHistory: ChatMessage[],
        promptSolutions: ChatSolution,
        signal?: AbortSignal
    ): Promise<void> {
        const headers = await getAuthHeaders();
        await axios.put(
            `${apiurl}/users/history/${chatId}`,
            { chatHistory, promptSolutions },
            { headers, signal }
        );
    }
};

/**
 * Service class for user preferences-related operations
 */
export const UserPreferencesService = {
    /**
     * Loads instructions preferences
     * @returns Promise containing instructions preferences response
     */
    async loadInstructionsPreferences(): Promise<PreferencesResponse> {
        const headers = await getAuthHeaders();
        const response = await axios.get<PreferencesResponse>(
            `${apiurl}/users/preferences/instructions`,
            { headers }
        );
        return response.data;
    },

    /**
     * Loads chat history preferences
     * @returns Promise containing chat history preferences response
     */
    async loadChatHistoryPreferences(): Promise<PreferencesResponse> {
        const headers = await getAuthHeaders();
        const response = await axios.get<PreferencesResponse>(
            `${apiurl}/users/preferences/chat_history`,
            { headers }
        );
        return response.data;
    },

    /**
     * Loads user preferences for both instructions and chat history
     * @returns Promise containing both preferences responses
     */
    async loadAllPreferences(): Promise<{
        instructionsResponse: PreferencesResponse;
        chatHistoryResponse: PreferencesResponse;
    }> {
        const [instructionsResponse, chatHistoryResponse] = await Promise.all([
            this.loadInstructionsPreferences(),
            this.loadChatHistoryPreferences()
        ]);

        return {
            instructionsResponse,
            chatHistoryResponse
        };
    },

    /**
     * Saves both instructions and chat history preferences
     * @param instructions User's custom instructions
     * @param chatHistory User's chat history preference
     * @returns Promise containing both preferences responses
     */
    async savePreferences(
        instructions: InstructionsPreference, 
        chatHistory: ChatHistoryPreference
    ): Promise<void> {
        const headers = await getAuthHeaders();
        
        await Promise.all([
            axios.post<PreferencesResponse>(
                `${apiurl}/users/preferences/instructions`,
                { instructions },
                { headers }
            ),
            axios.post<PreferencesResponse>(
                `${apiurl}/users/preferences/chat_history`,
                { chatHistory },
                { headers }
            )
        ]);
    }
};