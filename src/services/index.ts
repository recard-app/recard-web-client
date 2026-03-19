import axios from 'axios';
import { auth } from '../config/firebase';

export const apiurl = import.meta.env.VITE_BASE_URL;

/**
 * Gets the current user's authentication token and returns headers
 * Centralized auth check for all services
 */
export const getAuthHeaders = async () => {
    if (!auth.currentUser) {
        throw new Error('No authenticated user');
    }
    const token = await auth.currentUser.getIdToken();
    return {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
    };
};

// --- Axios Client for Auth-Critical Paths ---

const AUTH_REQUEST_TIMEOUT_MS = 15000;

/**
 * Configured axios instance for auth-critical API calls.
 * - Auto-attaches Bearer token via request interceptor
 * - Retries once on 401 with a force-refreshed token
 * - 15-second timeout
 *
 * Scoped to AuthService and deleteAccount only.
 * Other services continue using getAuthHeaders() + raw axios.
 */
export const apiClient = axios.create({
    baseURL: apiurl,
    timeout: AUTH_REQUEST_TIMEOUT_MS,
    headers: {
        Accept: 'application/json',
    },
});

// Request interceptor: auto-attach Bearer token
apiClient.interceptors.request.use(async (config) => {
    if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: retry once on 401 with force-refreshed token
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            auth.currentUser
        ) {
            originalRequest._retry = true;
            try {
                const token = await auth.currentUser.getIdToken(true);
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Token refresh failed -- propagate original 401
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

// --- Retry Utility ---

const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_RETRY_BASE_DELAY_MS = 500;

/**
 * Wraps an async function with retry logic for transient failures.
 * - Retries on network errors and 5xx responses
 * - Does NOT retry 4xx errors (client errors are not transient)
 * - Exponential backoff: 500ms, 1000ms
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = DEFAULT_MAX_RETRIES,
    baseDelayMs: number = DEFAULT_RETRY_BASE_DELAY_MS
): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            const status = error.response?.status;
            const isRetryable = !status || status >= 500;
            if (!isRetryable || attempt === maxRetries) {
                throw error;
            }
            await new Promise(resolve =>
                setTimeout(resolve, baseDelayMs * Math.pow(2, attempt))
            );
        }
    }
    throw lastError;
}

// Export all services
export * from './UserServices';
export * from './AuthService';
export * from './ChatService';
export * from './CardService';
export * from './ComponentService';
export * from './UndoService';
export * from './SSEClient';