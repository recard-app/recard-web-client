import { createContext, useContext } from 'react';
import type { CreditCardDetails, CardCredit } from '@/types/CreditCardTypes';
import type { UserCredit } from '@/types';

export interface FallbackData {
  userCredit: UserCredit;
  card: CreditCardDetails;
  cardCredit: CardCredit | null;
}

export interface CreditDrawerIdentifier {
  cardId: string;
  creditId: string;
}

export interface CreditDrawerContextType {
  isOpen: boolean;
  activeCreditId: CreditDrawerIdentifier | null;
  year: number;
  isLoading: boolean;
  openDrawer: (params: {
    cardId: string;
    creditId: string;
    year?: number;
    isLoading?: boolean;
    initialPeriodNumber?: number;
    fallbackData?: FallbackData;
  }) => void;
  closeDrawer: () => void;
  setYear: (year: number) => void;
  setLoading: (loading: boolean) => void;
  setFallbackData: (data: FallbackData) => void;
}

export const CreditDrawerContext = createContext<CreditDrawerContextType | undefined>(undefined);

export const useCreditDrawer = (): CreditDrawerContextType => {
  const context = useContext(CreditDrawerContext);
  if (context === undefined) {
    throw new Error('useCreditDrawer must be used within a CreditDrawerProvider');
  }
  return context;
};
