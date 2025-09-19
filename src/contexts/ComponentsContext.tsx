import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CardPerk, CardCredit, CardMultiplier } from '../types/CreditCardTypes';
import { ComponentService } from '../services';

interface ComponentsContextType {
  perks: CardPerk[];
  credits: CardCredit[];
  multipliers: CardMultiplier[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
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
  const [perks, setPerks] = useState<CardPerk[]>([]);
  const [credits, setCredits] = useState<CardCredit[]>([]);
  const [multipliers, setMultipliers] = useState<CardMultiplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComponents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const componentData = await ComponentService.fetchAllUserCardComponents();

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
    await fetchComponents();
  };

  useEffect(() => {
    if (autoFetch) {
      fetchComponents();
    }
  }, [autoFetch]);

  const value: ComponentsContextType = {
    perks,
    credits,
    multipliers,
    isLoading,
    error,
    refetch
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

export const useMultipliers = (): CardMultiplier[] => {
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

export const useMultiplierById = (multiplierId: string): CardMultiplier | undefined => {
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

export const useMultipliersByCardId = (cardId: string): CardMultiplier[] => {
  const { multipliers } = useComponents();
  return multipliers.filter(multiplier => multiplier.ReferenceCardId === cardId);
};