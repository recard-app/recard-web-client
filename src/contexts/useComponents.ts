import { createContext, useContext } from 'react';
import type { CardPerk, CardCredit, EnrichedMultiplier } from '../types/CreditCardTypes';
import { isSelectableMultiplier } from '../types/CreditCardTypes';

export interface ComponentsContextType {
  perks: CardPerk[];
  credits: CardCredit[];
  multipliers: EnrichedMultiplier[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateMultiplierSelection: (multiplierId: string, categoryId: string) => Promise<void>;
}

export const ComponentsContext = createContext<ComponentsContextType | undefined>(undefined);

export const useComponents = (): ComponentsContextType => {
  const context = useContext(ComponentsContext);
  if (context === undefined) {
    throw new Error('useComponents must be used within a ComponentsProvider');
  }
  return context;
};

export const useCredits = (): CardCredit[] => {
  const { credits } = useComponents();
  return credits;
};

export const usePerks = (): CardPerk[] => {
  const { perks } = useComponents();
  return perks;
};

export const useMultipliers = (): EnrichedMultiplier[] => {
  const { multipliers } = useComponents();
  return multipliers;
};

export const useCreditById = (creditId: string): CardCredit | undefined => {
  const { credits } = useComponents();
  return credits.find(credit => credit.id === creditId);
};

export const usePerkById = (perkId: string): CardPerk | undefined => {
  const { perks } = useComponents();
  return perks.find(perk => perk.id === perkId);
};

export const useMultiplierById = (multiplierId: string): EnrichedMultiplier | undefined => {
  const { multipliers } = useComponents();
  return multipliers.find(multiplier => multiplier.id === multiplierId);
};

export const useCreditsByCardId = (cardId: string): CardCredit[] => {
  const { credits } = useComponents();
  return credits.filter(credit => credit.ReferenceCardId === cardId);
};

export const usePerksByCardId = (cardId: string): CardPerk[] => {
  const { perks } = useComponents();
  return perks.filter(perk => perk.ReferenceCardId === cardId);
};

export const useMultipliersByCardId = (cardId: string): EnrichedMultiplier[] => {
  const { multipliers } = useComponents();
  return multipliers.filter(multiplier => multiplier.ReferenceCardId === cardId);
};

export const useMultiplierSelection = (multiplierId: string) => {
  const { multipliers, updateMultiplierSelection } = useComponents();

  const multiplier = multipliers.find(m => m.id === multiplierId);
  const isSelectable = multiplier ? isSelectableMultiplier(multiplier) : false;

  return {
    isSelectable,
    allowedCategories: isSelectable && multiplier ? multiplier.allowedCategories || [] : [],
    selectedCategory: isSelectable && multiplier ? multiplier.userSelectedCategory || null : null,
    updateSelection: (categoryId: string) => updateMultiplierSelection(multiplierId, categoryId),
  };
};
