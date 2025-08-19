import axios from 'axios';
import { apiurl, getAuthHeaders } from '../index';
import { SUBSCRIPTION_PLAN, SubscriptionPlan, SubscriptionPlanResponse } from '../../types';

export const UserService = {
    /**
     * Fetches user's subscription plan
     * @returns Promise containing the user's subscription plan as a valid SubscriptionPlanType
     */
    async fetchUserSubscriptionPlan(): Promise<SubscriptionPlan> {
        const headers = await getAuthHeaders();
        const response = await axios.get<SubscriptionPlanResponse>(
            `${apiurl}/users/subscription/plan`,
            { headers }
        );

        if (response.data.success && response.data.subscriptionPlan) {
            const validPlans = Object.values(SUBSCRIPTION_PLAN);
            if (validPlans.includes(response.data.subscriptionPlan as any)) {
                return response.data.subscriptionPlan;
            }
        }

        return SUBSCRIPTION_PLAN.FREE;
    },
    /**
     * Fetches the authenticated user's account creation date as a Date
     */
    async fetchAccountCreationDate(): Promise<Date | null> {
        try {
            const headers = await getAuthHeaders();
            const response = await axios.get<{ createdAt: string }>(
                `${apiurl}/users/account-created`,
                { headers }
            );
            if (response.data?.createdAt) {
                return new Date(response.data.createdAt);
            }
            return null;
        } catch (error) {
            return null;
        }
    }
};


