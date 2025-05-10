import axios from 'axios';
import { apiurl, getAuthHeaders } from './index';
import { 
    Conversation, 
    StartDateResponse, 
    HistoryParams, 
    PagedHistoryResponse,
    ChatMessage,
    ChatSolution,
    CardDetailsList,
    ChatSolutionSelectedCardId 
} from '../types';
import { ChatHistoryPreference, InstructionsPreference, PreferencesResponse, SubscriptionPlan, ShowCompletedOnlyPreference } from '../types/UserTypes';

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
    },

    /**
     * Updates the selected card for a specific chat transaction
     * @param chatId ID of the chat to update
     * @param cardSelection ID of the selected card
     * @returns Promise<void>
     */
    async updateTransactionCardSelection(
        chatId: string,
        cardSelection: ChatSolutionSelectedCardId
    ): Promise<void> {
        const headers = await getAuthHeaders();
        await axios.put(
            `${apiurl}/users/history/${chatId}/transaction-card-selection`,
            { cardSelection },
            { headers }
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
     * Updates instructions preference
     * @param instructions User's custom instructions
     * @returns Promise<void>
     */
    async updateInstructionsPreference(
        instructions: InstructionsPreference
    ): Promise<void> {
        const headers = await getAuthHeaders();
        await axios.post<PreferencesResponse>(
            `${apiurl}/users/preferences/instructions`,
            { instructions },
            { headers }
        );
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
     * Updates chat history preference
     * @param chatHistory User's chat history preference
     * @returns Promise<void>
     */
    async updateChatHistoryPreference(
        chatHistory: ChatHistoryPreference
    ): Promise<void> {
        const headers = await getAuthHeaders();
        await axios.post<PreferencesResponse>(
            `${apiurl}/users/preferences/chat_history`,
            { chatHistory },
            { headers }
        );
    },

    /**
     * Loads show completed only preference
     * @returns Promise containing show completed only preference response
     */
    async loadShowCompletedOnlyPreference(): Promise<PreferencesResponse> {
        const headers = await getAuthHeaders();
        const response = await axios.get<PreferencesResponse>(
            `${apiurl}/users/preferences/only_show_completed_transactions`,
            { headers }
        );
        return response.data;
    },

    /**
     * Updates show completed only preference
     * @param showCompletedOnly Whether to show only completed transactions
     * @returns Promise<void>
     */
    async updateShowCompletedOnlyPreference(
        showCompletedOnly: ShowCompletedOnlyPreference
    ): Promise<void> {
        const headers = await getAuthHeaders();
        await axios.post<PreferencesResponse>(
            `${apiurl}/users/preferences/only_show_completed_transactions`,
            { showCompletedOnly },
            { headers }
        );
    },

    /**
     * Loads all user preferences including instructions, chat history, and show completed only
     * @returns Promise containing all preferences responses
     */
    async loadAllPreferences(): Promise<{
        instructionsResponse: PreferencesResponse;
        chatHistoryResponse: PreferencesResponse;
        showCompletedOnlyResponse: PreferencesResponse;
    }> {
        const [instructionsResponse, chatHistoryResponse, showCompletedOnlyResponse] = await Promise.all([
            this.loadInstructionsPreferences(),
            this.loadChatHistoryPreferences(),
            this.loadShowCompletedOnlyPreference()
        ]);

        return {
            instructionsResponse,
            chatHistoryResponse,
            showCompletedOnlyResponse
        };
    },

    /**
     * Saves all preferences
     * @param instructions User's custom instructions
     * @param chatHistory User's chat history preference
     * @param showCompletedOnly User's show completed only preference
     * @returns Promise<void>
     */
    async savePreferences(
        instructions: InstructionsPreference, 
        chatHistory: ChatHistoryPreference,
        showCompletedOnly: ShowCompletedOnlyPreference
    ): Promise<void> {
        await Promise.all([
            this.updateInstructionsPreference(instructions),
            this.updateChatHistoryPreference(chatHistory),
            this.updateShowCompletedOnlyPreference(showCompletedOnly)
        ]);
    }
};