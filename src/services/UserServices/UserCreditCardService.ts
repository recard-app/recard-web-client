import axios from 'axios';
import { apiurl, getAuthHeaders } from '../index';
import { CardDetailsList } from '../../types';
import { CreditCardDetails } from '../../types/CreditCardTypes';

export const UserCreditCardService = {
    /**
     * Updates user's selected credit cards
     */
    async updateUserCards(selectedCards: { cardId: string; isDefaultCard: boolean }[]): Promise<void> {
        const headers = await getAuthHeaders();
        await axios.post(
            `${apiurl}/users/cards/update`,
            { returnCreditCards: selectedCards },
            { headers }
        );
    },

    /**
     * Fetches user's credit card details
     * @returns Promise containing the user's card details
     */
    async fetchUserCardDetails(): Promise<CardDetailsList> {
        const headers = await getAuthHeaders();
        const response = await axios.get<CardDetailsList>(
            `${apiurl}/users/cards/details`,
            { headers }
        );
        return response.data;
    },
    
    /**
     * Fetches detailed information for all user's selected credit cards
     * @returns Promise containing the detailed credit card information for user's cards
     */
    async fetchUserCardsDetailedInfo(): Promise<CreditCardDetails[]> {
        const headers = await getAuthHeaders();
        const response = await axios.get<CreditCardDetails[]>(
            `${apiurl}/credit-cards/list/details`,
            { 
                headers,
                params: { userCardsOnly: true } 
            }
        );
        return response.data;
    }
};


