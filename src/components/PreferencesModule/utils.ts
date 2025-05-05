import { ChatHistoryPreference } from '../../types/UserTypes';

// Interface for chat history options
export interface ChatHistoryOption {
    value: ChatHistoryPreference;
    label: string;
}

// Array of chat history options
export const CHAT_HISTORY_OPTIONS: ChatHistoryOption[] = [
    { value: 'keep_history', label: 'Keep chat history' },
    { value: 'do_not_track_history', label: 'Do not track chat history' },
    // { value: 'keep_week', label: 'Keep chat history for 1 week' },
    // { value: 'keep_month', label: 'Keep chat history for 1 month' }
];