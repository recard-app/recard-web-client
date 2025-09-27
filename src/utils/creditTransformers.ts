import { PrioritizedCredit } from '../types/CardCreditsTypes';
import { UserCredit, UserCreditWithExpiration, SingleCreditHistory, CREDIT_USAGE } from '../types';

/**
 * Converts PrioritizedCredit array to UserCreditWithExpiration array for use with CreditList component
 */
export function convertPrioritizedCreditsToUserCredits(prioritizedCredits: PrioritizedCredit[]): UserCreditWithExpiration[] {
  return prioritizedCredits.map((pc): UserCreditWithExpiration => {
    // Create a single history entry based on the current usage status
    const history: SingleCreditHistory[] = [{
      PeriodNumber: 1, // For sidebar display, we use period 1 as default
      CreditUsage: pc.usedAmount >= pc.totalAmount ? CREDIT_USAGE.USED :
                   pc.usedAmount > 0 ? CREDIT_USAGE.PARTIALLY_USED :
                   CREDIT_USAGE.NOT_USED,
      ValueUsed: pc.usedAmount
    }];

    return {
      CardId: pc.cardId,
      CreditId: pc.id,
      History: history,
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