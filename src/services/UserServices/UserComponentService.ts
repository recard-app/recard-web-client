import axios from 'axios';
import { apiurl, getAuthHeaders } from '../index';
import { UserComponentTrackingPreferences, ComponentType } from '../../types';
import { apiCache, CACHE_KEYS } from '../../utils/ApiCache';

export const UserComponentService = {
    /**
     * Returns the authenticated user's unified component tracking preferences
     * Includes preferences for credits, multipliers, and perks
     */
    async fetchComponentTrackingPreferences(): Promise<UserComponentTrackingPreferences> {
        return apiCache.get(CACHE_KEYS.COMPONENT_TRACKING_PREFERENCES, async () => {
            const headers = await getAuthHeaders();
            const response = await axios.get<UserComponentTrackingPreferences>(
                `${apiurl}/users/cards/components/preferences`,
                { headers }
            );
            return response.data;
        });
    },

    /**
     * Updates the disabled preference for a specific component (credit, multiplier, or perk)
     * Returns the updated UserComponentTrackingPreferences
     */
    async updateComponentDisabledPreference(params: {
        cardId: string;
        componentId: string;
        componentType: ComponentType;
        disabled: boolean;
    }): Promise<UserComponentTrackingPreferences> {
        const headers = await getAuthHeaders();
        const response = await axios.put<UserComponentTrackingPreferences>(
            `${apiurl}/users/cards/components/preferences`,
            params,
            { headers }
        );

        // Invalidate cache after successful update
        apiCache.invalidate(CACHE_KEYS.COMPONENT_TRACKING_PREFERENCES);

        return response.data;
    },

    /**
     * Invalidates the component tracking preferences cache
     */
    invalidateCache(): void {
        apiCache.invalidate(CACHE_KEYS.COMPONENT_TRACKING_PREFERENCES);
    }
};
