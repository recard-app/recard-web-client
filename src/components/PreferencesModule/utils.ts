import { CHAT_HISTORY_PREFERENCE } from '../../types';
import { ChatHistoryPreference } from '../../types/UserTypes';

// Interface for chat history options
export interface ChatHistoryOption {
    value: ChatHistoryPreference;
    label: string;
}

// Array of chat history options
export const CHAT_HISTORY_OPTIONS: ChatHistoryOption[] = [
    { value: CHAT_HISTORY_PREFERENCE.KEEP_HISTORY, label: 'Keep chat history' },
    { value: CHAT_HISTORY_PREFERENCE.DO_NOT_TRACK_HISTORY, label: 'Do not track chat history' },
    // { value: 'keep_week', label: 'Keep chat history for 1 week' },
    // { value: 'keep_month', label: 'Keep chat history for 1 month' }
];