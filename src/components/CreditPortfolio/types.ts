import {
  CalendarUserCredits,
  UserCredit,
  SingleCreditHistory,
  CreditPeriodType,
  CreditUsageType,
  PrioritizedCredit,
  CREDIT_USAGE_DISPLAY_COLORS
} from '@/types/CardCreditsTypes';
import { CardCredit, CreditCardDetails } from '@/types/CreditCardTypes';

// Re-export for convenience
export type {
  CalendarUserCredits,
  UserCredit,
  SingleCreditHistory,
  CreditPeriodType,
  CreditUsageType,
  CardCredit,
  CreditCardDetails,
  PrioritizedCredit
};

export { CREDIT_USAGE_DISPLAY_COLORS };

// Component-specific types

export interface CardCreditSummary {
  creditCount: number;
  totalMonthlyValue: number;
  totalUsedValue: number;
  totalPossibleValue: number;
}

export interface CreditPortfolioViewProps {
  userCardDetails: CreditCardDetails[];
  reloadTrigger?: number;
  onRefreshMonthlyStats?: () => void;
  onAddUpdatingCreditId?: (cardId: string, creditId: string, periodNumber: number) => void;
  onRemoveUpdatingCreditId?: (cardId: string, creditId: string, periodNumber: number) => void;
  isCreditUpdating?: (cardId: string, creditId: string, periodNumber: number) => boolean;
  onClearAllUpdatingCredits?: () => void;
}

export interface YearDropdownProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  availableYears: number[];
  disabled?: boolean;
  loading?: boolean;
}

export interface CreditSectionProps {
  credit: UserCredit;
  cardCredit: CardCredit;
  onClick: () => void;
}

export interface CreditCardAccordionProps {
  card: CreditCardDetails;
  credits: UserCredit[];
  creditMetadata: Map<string, CardCredit>;
  isExpanded: boolean;
  onToggle: () => void;
  onPeriodClick: (credit: UserCredit, cardCredit: CardCredit, periodNumber: number, anniversaryYear?: number) => void;
  isLoading?: boolean;  // Indicates year data is loading (show pulse animation)
}

export interface SelectedCreditState {
  credit: UserCredit;
  card: CreditCardDetails;
  cardCredit: CardCredit;
  periodNumber: number;
  anniversaryYear?: number;  // For anniversary-based credits
}
