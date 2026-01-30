import axios from 'axios';
import { apiurl, getAuthHeaders } from '../index';
import {
    Conversation,
    StartDateResponse,
    HistoryParams,
    PagedHistoryResponse,
    ChatMessage,
} from '../../types';
import { ChatComponentBlock } from '../../types/ChatComponentTypes';

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
     * @param componentBlocks Array of component blocks from agent responses
     * @param signal Optional AbortController signal
     * @param skipTitleGeneration If true, skip AI title generation and use "New Chat"
     * @returns Promise containing the created conversation
     */
    async createChatHistory(
        chatHistory: ChatMessage[],
        componentBlocks: ChatComponentBlock[],
        signal?: AbortSignal,
        skipTitleGeneration?: boolean
    ): Promise<Conversation> {
        const headers = await getAuthHeaders();
        const response = await axios.post<Conversation>(
            `${apiurl}/users/history`,
            {
                chatHistory,
                componentBlocks,
                skipTitleGeneration
            },
            { headers, signal }
        );
        return response.data;
    },

    /**
     * Generates a title for a chat based on its conversation using AI
     * @param chatId ID of the chat to generate title for
     * @returns Promise containing the generated chat description
     */
    async generateChatTitle(chatId: string): Promise<string> {
        const headers = await getAuthHeaders();
        const response = await axios.post<{ chatDescription: string }>(
            `${apiurl}/users/history/${chatId}/generate-title`,
            {},
            { headers }
        );
        return response.data.chatDescription;
    },

    /**
     * Updates an existing chat history entry
     * @param chatId ID of the chat to update
     * @param chatHistory Updated array of chat messages
     * @param componentBlocks Array of component blocks from agent responses
     * @param signal Optional AbortController signal
     * @returns Promise<void>
     */
    async updateChatHistory(
        chatId: string,
        chatHistory: ChatMessage[],
        componentBlocks: ChatComponentBlock[],
        signal?: AbortSignal
    ): Promise<void> {
        const headers = await getAuthHeaders();
        await axios.put(
            `${apiurl}/users/history/${chatId}`,
            {
                chatHistory,
                componentBlocks
            },
            { headers, signal }
        );
    },

    /**
     * Updates the chat description for a specific chat
     * @param chatId ID of the chat to update
     * @param chatDescription New description for the chat
     * @returns Promise<void>
     */
    async updateChatDescription(
        chatId: string,
        chatDescription: string
    ): Promise<void> {
        const headers = await getAuthHeaders();
        await axios.put(
            `${apiurl}/users/history/${chatId}/chat_description`,
            { chatDescription },
            { headers }
        );
    },

    /**
     * Fetches recent chat history entries with full conversation data for sidebar preview
     * @param size Optional size parameter (defaults to 3, max 10)
     * @returns Promise containing the full conversation data
     */
    async fetchChatHistoryPreview(size: number = 3): Promise<{ chatHistory: Conversation[] }> {
        const headers = await getAuthHeaders();
        const response = await axios.get<{ chatHistory: Conversation[] }>(
            `${apiurl}/users/history/preview`,
            { headers, params: { size: Math.min(size, 10) } }
        );
        return response.data;
    }
};


