import { CHAT_HISTORY_PREFERENCE, CHAT_MODE } from '../../types';
import { ChatHistoryPreference, ChatModePreference } from '../../types/UserTypes';

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

// Interface for chat mode options
export interface ChatModeOption {
    value: ChatModePreference;
    label: string;
    description: string;
}

// Array of chat mode options
export const CHAT_MODE_OPTIONS: ChatModeOption[] = [
    {
        value: CHAT_MODE.UNIFIED,
        label: 'Unified',
        description: 'Single AI agent handles all requests (faster, simpler)'
    },
    {
        value: CHAT_MODE.ORCHESTRATED,
        label: 'Orchestrated',
        description: 'Multiple specialized AI agents work together (more thorough)'
    },
];

// LocalStorage key for chat mode
export const CHAT_MODE_STORAGE_KEY = 'swipe_chat_mode';