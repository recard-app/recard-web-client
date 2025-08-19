import axios from 'axios';
import { apiurl, getAuthHeaders } from '../index';
import { 
    PreferencesResponse, 
    InstructionsPreference, 
    ChatHistoryPreference, 
    ShowCompletedOnlyPreference 
} from '../../types';

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


