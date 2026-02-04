import axios from 'axios';
import { apiurl, getAuthHeaders } from '../index';
import {
    BatchedPreferencesResponse,
    BatchedPreferencesRequest,
    InstructionsPreference,
    ChatHistoryPreference,
} from '../../types';
import { apiCache, CACHE_KEYS } from '../../utils/ApiCache';

export const UserPreferencesService = {
    /**
     * Loads all user preferences in a single API call
     * @returns Promise containing all user preferences
     */
    async loadAllPreferences(): Promise<BatchedPreferencesResponse> {
        return apiCache.get(CACHE_KEYS.USER_PREFERENCES_BATCH, async () => {
            const headers = await getAuthHeaders();
            const response = await axios.get<BatchedPreferencesResponse>(
                `${apiurl}/users/preferences/batch`,
                { headers }
            );
            return response.data;
        });
    },

    /**
     * Updates multiple preferences in a single API call
     * @param updates Object containing the preferences to update
     * @returns Promise<BatchedPreferencesResponse>
     */
    async updatePreferences(updates: BatchedPreferencesRequest): Promise<BatchedPreferencesResponse> {
        const headers = await getAuthHeaders();
        const response = await axios.post<BatchedPreferencesResponse>(
            `${apiurl}/users/preferences/batch`,
            updates,
            { headers }
        );

        // Clear cache after successful update
        apiCache.invalidate(CACHE_KEYS.USER_PREFERENCES_BATCH);

        return response.data;
    },

    /**
     * Updates instructions preference
     * @param instructions User's custom instructions
     * @returns Promise<BatchedPreferencesResponse>
     */
    async updateInstructionsPreference(
        instructions: InstructionsPreference
    ): Promise<BatchedPreferencesResponse> {
        return this.updatePreferences({ instructions });
    },

    /**
     * Updates chat history preference
     * @param chatHistory User's chat history preference
     * @returns Promise<BatchedPreferencesResponse>
     */
    async updateChatHistoryPreference(
        chatHistory: ChatHistoryPreference
    ): Promise<BatchedPreferencesResponse> {
        return this.updatePreferences({ chatHistory });
    },

    /**
     * Saves all preferences in a single API call
     * @param instructions User's custom instructions
     * @param chatHistory User's chat history preference
     * @returns Promise<BatchedPreferencesResponse>
     */
    async savePreferences(
        instructions: InstructionsPreference,
        chatHistory: ChatHistoryPreference
    ): Promise<BatchedPreferencesResponse> {
        return this.updatePreferences({
            instructions,
            chatHistory,
        });
    },

    /**
     * Clear preferences cache - useful when preferences change
     */
    clearCache(): void {
        apiCache.invalidate(CACHE_KEYS.USER_PREFERENCES_BATCH);
    }
};