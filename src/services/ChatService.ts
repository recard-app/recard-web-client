import axios from 'axios';
import { apiurl, getAuthHeaders } from './index';
import { ChatRequestData, ChatSolution, MessageContentBlock } from '../types';

export const ChatService = {
    /**
     * Gets AI response for chat message
     * @param requestData Chat request data
     * @param signal AbortController signal for cancellation
     * @returns Promise containing the AI response
     */
    async getChatResponse(requestData: ChatRequestData, signal?: AbortSignal): Promise<string> {
        const headers = await getAuthHeaders();
        const response = await axios.post(
            `${apiurl}/chat/response`,
            requestData,
            { 
                headers,
                signal 
            }
        );
        return response.data;
    },

    /**
     * Gets solution recommendations from AI
     * @param requestData Chat request data with updated chat history
     * @param signal AbortController signal for cancellation
     * @returns Promise containing the solution recommendations and content blocks
     */
    async getChatSolution(requestData: ChatRequestData, signal?: AbortSignal): Promise<{ solutions: ChatSolution; contentBlocks: MessageContentBlock[] }> {
        const headers = await getAuthHeaders();
        const response = await axios.post<{ solutions: ChatSolution; contentBlocks: MessageContentBlock[] }>(
            `${apiurl}/chat/solution`,
            requestData,
            {
                headers,
                signal
            }
        );
        return response.data;
    }
};