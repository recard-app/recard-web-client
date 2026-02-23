import axios from 'axios';
import { apiurl, getAuthHeaders } from '../index';
import { SUBSCRIPTION_PLAN, SUBSCRIPTION_STATUS, SubscriptionPlan, SubscriptionPlanResponse, SubscriptionStatusType, BillingPeriodType } from '../../types';

/**
 * Full subscription info returned from the API
 */
export interface SubscriptionInfo {
    subscriptionPlan: SubscriptionPlan;
    subscriptionStatus: SubscriptionStatusType;
    subscriptionBillingPeriod: BillingPeriodType | null;
    subscriptionExpiresAt: string | null;
}

/**
 * Response structure for daily digest endpoint
 */
export interface DailyDigestResponse {
    data: {
        date: string;
        title: string;
        content: string;
        generatedAt: string;
        expiresAt: string;
    };
    meta: {
        cached: boolean;
        cacheAge?: number;
    };
}

export const UserService = {
    /**
     * Fetches user's full subscription info (plan, status, expiration, billing period)
     * @returns Promise containing the full subscription info
     */
    async fetchUserSubscription(): Promise<SubscriptionInfo> {
        const headers = await getAuthHeaders();
        const response = await axios.get<SubscriptionPlanResponse>(
            `${apiurl}/users/subscription/plan`,
            { headers }
        );

        if (response.data.success && response.data.subscriptionPlan) {
            const validPlans = Object.values(SUBSCRIPTION_PLAN);
            if (validPlans.includes(response.data.subscriptionPlan as any)) {
                return {
                    subscriptionPlan: response.data.subscriptionPlan,
                    subscriptionStatus: response.data.subscriptionStatus || SUBSCRIPTION_STATUS.NONE,
                    subscriptionBillingPeriod: response.data.subscriptionBillingPeriod ?? null,
                    subscriptionExpiresAt: response.data.subscriptionExpiresAt ?? null,
                };
            }
        }

        return {
            subscriptionPlan: SUBSCRIPTION_PLAN.FREE,
            subscriptionStatus: SUBSCRIPTION_STATUS.NONE,
            subscriptionBillingPeriod: null,
            subscriptionExpiresAt: null,
        };
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
    },

    /**
     * Fetches the daily digest for the authenticated user.
     * Returns null on error (silent failure - digest is optional).
     * @param forceRefresh - If true, forces regeneration instead of using cache
     */
    async fetchDailyDigest(forceRefresh = false): Promise<DailyDigestResponse | null> {
        try {
            const headers = await getAuthHeaders();
            const params = forceRefresh ? { forceRefresh: 'true' } : {};
            const response = await axios.get<DailyDigestResponse>(
                `${apiurl}/api/v1/users/digest`,
                { headers, params }
            );
            return response.data;
        } catch (error) {
            // Silent failure - digest is optional enhancement
            return null;
        }
    }
};


