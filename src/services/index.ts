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

// Export all services
export * from './UserService';
export * from './AuthService';
export * from './ChatService';
export * from './CardService';