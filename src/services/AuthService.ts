import axios from "axios";
import { apiurl, getAuthHeaders } from "./index";

/**
 * Service class for user authentication-related operations
 */
export const AuthService = {
    /**
     * Handles email sign-in authentication with the backend
     * @returns Promise<void>
     */
    async emailSignIn(): Promise<void> {
        const headers = await getAuthHeaders();
        const response = await axios.post(
            `${apiurl}/auth/signin`,
            {},  // empty body since we're just validating the token
            { headers }
        );

        if (response.status !== 200) {
            throw new Error('Failed to authenticate with the server');
        }
    },

    /**
     * Handles Google sign-in/sign-up authentication with the backend
     * @param isNewUser Whether the user is new or existing
     * @returns Promise<void>
     */
    async googleSignIn(isNewUser: boolean): Promise<void> {
        const headers = await getAuthHeaders();
        const response = await axios.post(
            `${apiurl}/auth/${isNewUser ? 'signup' : 'signin'}`,
            {},  // empty body since we're just validating the token
            { headers }
        );

        if (response.status !== 200) {
            throw new Error('Failed to authenticate with the server');
        }
    },

    /**
     * Handles email sign-up with the backend
     * @param firstName User's first name
     * @param lastName User's last name
     * @returns Promise<void>
     */
    async emailSignUp(firstName: string, lastName: string): Promise<void> {
        const headers = await getAuthHeaders();
        const response = await axios.post(
            `${apiurl}/auth/signup`,
            { firstName, lastName },
            { headers }
        );

        if (response.status !== 200) {
            const data = await response.data;
            throw new Error(data.error || 'Registration failed');
        }
    }
};