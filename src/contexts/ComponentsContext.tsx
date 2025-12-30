import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CardPerk, CardCredit, EnrichedMultiplier, isSelectableMultiplier } from '../types/CreditCardTypes';
import { ComponentService } from '../services';
import { useAuth } from '../context/AuthContext';
import { apiCache } from '../utils/ApiCache';

interface ComponentsContextType {
  perks: CardPerk[];
  credits: CardCredit[];
  multipliers: EnrichedMultiplier[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateMultiplierSelection: (multiplierId: string, categoryId: string) => Promise<void>;
}

const ComponentsContext = createContext<ComponentsContextType | undefined>(undefined);

interface ComponentsProviderProps {
  children: ReactNode;
  autoFetch?: boolean; // Whether to automatically fetch data on mount
}

export const ComponentsProvider: React.FC<ComponentsProviderProps> = ({
  children,
  autoFetch = true
}) => {
  const { user } = useAuth();
  const [perks, setPerks] = useState<CardPerk[]>([]);
  const [credits, setCredits] = useState<CardCredit[]>([]);
  const [multipliers, setMultipliers] = useState<EnrichedMultiplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComponents = async (forceRefresh: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const componentData = await ComponentService.fetchAllUserCardComponents(forceRefresh);

      setPerks(componentData.perks);
      setCredits(componentData.credits);
      setMultipliers(componentData.multipliers);
    } catch (err) {
      console.error('Failed to fetch components:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch components');
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    // Force refresh to bypass cache and ensure fresh data
    await fetchComponents(true);
  };

  /**
   * Update user's category selection for a selectable multiplier
   * Uses optimistic update for immediate UI feedback
   */
  const updateMultiplierSelection = async (multiplierId: string, categoryId: string) => {
    // Find the multiplier and its allowed categories
    const multiplier = multipliers.find(m => m.id === multiplierId);
    if (!multiplier || !isSelectableMultiplier(multiplier)) {
      throw new Error('Invalid multiplier or not a selectable type');
    }

    const newCategory = multiplier.allowedCategories?.find(c => c.id === categoryId);
    if (!newCategory) {
      throw new Error('Category not found in allowed categories');
    }

    // Optimistic update
    setMultipliers(prev => prev.map(m => {
      if (m.id === multiplierId) {
        return {
          ...m,
          userSelectedCategory: newCategory,
        };
      }
      return m;
    }));

    try {
      await ComponentService.updateMultiplierSelection(multiplierId, categoryId);
      // Refresh multipliers to get updated data from server
      await fetchComponents(true);
    } catch (err) {
      // Revert on error by refetching
      console.error('Failed to update selection:', err);
      await fetchComponents(true);
      throw err;
    }
  };

  useEffect(() => {
    if (autoFetch && user) {
      fetchComponents();
    } else if (!user) {
      // Clear data when user logs out
      setPerks([]);
      setCredits([]);
      setMultipliers([]);
      setError(null);
      ComponentService.clearCache();
      apiCache.clearUserData();
    }
  }, [autoFetch, user]);

  const value: ComponentsContextType = {
    perks,
    credits,
    multipliers,
    isLoading,
    error,
    refetch,
    updateMultiplierSelection,
  };

  return (
    <ComponentsContext.Provider value={value}>
      {children}
    </ComponentsContext.Provider>
  );
};

export const useComponents = (): ComponentsContextType => {
  const context = useContext(ComponentsContext);
  if (context === undefined) {
    throw new Error('useComponents must be used within a ComponentsProvider');
  }
  return context;
};

// Individual hooks for specific component types
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

// Helper hooks to get component data by ID or card ID
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

/**
 * Hook to access and update selection for a selectable multiplier
 */
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