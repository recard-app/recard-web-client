import { PrioritizedCredit } from '../types/CardCreditsTypes';
import { UserCreditWithExpiration } from '../types';

/**
 * Converts PrioritizedCredit array to UserCreditWithExpiration array for use with CreditList component.
 * All expiration calculations are done server-side - this function maps the server data to the client type.
 */
export function convertPrioritizedCreditsToUserCredits(prioritizedCredits: PrioritizedCredit[]): UserCreditWithExpiration[] {
  return prioritizedCredits.map((pc): UserCreditWithExpiration => {
    return {
      CardId: pc.cardId,
      CreditId: pc.id,
      History: pc.History,
      AssociatedPeriod: pc.period,
      isExpiring: pc.isExpiring,
      daysUntilExpiration: pc.daysUntilExpiration,
    };
  });
}