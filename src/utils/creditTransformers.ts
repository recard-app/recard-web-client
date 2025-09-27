import { PrioritizedCredit } from '../types/CardCreditsTypes';
import { UserCredit, UserCreditWithExpiration, SingleCreditHistory, CREDIT_USAGE } from '../types';

/**
 * Converts PrioritizedCredit array to UserCreditWithExpiration array for use with CreditList component
 */
export function convertPrioritizedCreditsToUserCredits(prioritizedCredits: PrioritizedCredit[]): UserCreditWithExpiration[] {
  return prioritizedCredits.map((pc): UserCreditWithExpiration => {
    // Use the actual History data from PrioritizedCredit instead of creating fake data
    return {
      CardId: pc.cardId,
      CreditId: pc.id,
      History: pc.History, // Use the complete history from the server
      AssociatedPeriod: pc.period,
      // Use expiration data directly from server without client-side calculation
      isExpiring: pc.isExpiring,
      daysUntilExpiration: pc.daysUntilExpiration,
      expirationDate: pc.expirationDate,
      // ActiveMonths is optional and not available in PrioritizedCredit, so we omit it
    };
  });
}

/**
 * Calculates days until expiration for a credit
 */
export function calculateDaysUntilExpiration(expirationDate: string): number {
  const expDate = new Date(expirationDate);
  const now = new Date();
  const diffTime = expDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Determines if a credit is expiring soon (within 30 days)
 */
export function isCreditExpiringSoon(expirationDate: string): boolean {
  const daysUntilExpiration = calculateDaysUntilExpiration(expirationDate);
  return daysUntilExpiration <= 30 && daysUntilExpiration > 0;
}