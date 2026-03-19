import { apiClient, withRetry } from "./index";

export type SyncStatus = 'created' | 'repaired' | 'already_initialized';

/**
 * Service for auth-critical backend operations.
 * Uses apiClient (auto-token, 401-retry, timeout) instead of raw axios.
 */
export const AuthService = {
    /**
     * Idempotent account sync with the backend.
     * Replaces emailSignIn, googleSignIn, and emailSignUp.
     *
     * @param options.firstName Required for new password-provider accounts
     * @param options.lastName  Required for new password-provider accounts
     * @returns The sync status from the server
     */
    async sync(options?: { firstName?: string; lastName?: string }): Promise<{
        status: SyncStatus;
    }> {
        const body: Record<string, string> = {};
        if (options?.firstName) body.firstName = options.firstName;
        if (options?.lastName) body.lastName = options.lastName;

        const response = await withRetry(() =>
            apiClient.post('/auth/sync', body)
        );
        return response.data.data;
    },

    /**
     * Deletes the user's account and all associated data
     * @param reason Optional reason for account deletion (for analytics)
     */
    async deleteAccount(reason?: string): Promise<void> {
        await apiClient.delete('/users/account', {
            data: { reason }
        });
    }
};
