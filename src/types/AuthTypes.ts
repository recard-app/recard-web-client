import { User as FirebaseUser } from 'firebase/auth';

/**
 * Interface representing the response from the authentication service.
 */
export interface AuthResponse {
    user: FirebaseUser; // The authenticated Firebase user object
    token: string;      // The authentication token for the user
    isNewUser?: boolean; // Optional flag indicating if the user is new
}