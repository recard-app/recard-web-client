import { CHAT_HISTORY_PREFERENCE, AGENT_MODE_PREFERENCE } from '../../types';
import { ChatHistoryPreference, AgentModePreference } from '../../types/UserTypes';

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

// Interface for agent mode options
export interface AgentModeOption {
    value: AgentModePreference;
    label: string;
    description: string;
}

// Array of agent mode options
export const AGENT_MODE_OPTIONS: AgentModeOption[] = [
    {
        value: AGENT_MODE_PREFERENCE.SIMPLIFIED,
        label: 'Smart',
        description: 'Intelligent, efficient answers for everyday card questions.'
    },
    {
        value: AGENT_MODE_PREFERENCE.ORCHESTRATED,
        label: 'Deep Dive',
        description: 'Multi-step research using specialized agents. Best for complex comparisons and in-depth analysis.'
    }
];