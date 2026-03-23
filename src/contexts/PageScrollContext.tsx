import { createContext, useCallback, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useScrollShadow } from '@/hooks/useScrollShadow';

interface PageScrollState {
  isScrolledFromTop: boolean;
  isScrolledFromBottom: boolean;
  hasHeaderControls: boolean;
  registerScrollContainer: (element: HTMLElement | null) => void;
  setHasHeaderControls: (value: boolean) => void;
}

const defaultState: PageScrollState = {
  isScrolledFromTop: false,
  isScrolledFromBottom: false,
  hasHeaderControls: false,
  registerScrollContainer: () => {},
  setHasHeaderControls: () => {},
};

const PageScrollContext = createContext<PageScrollState>(defaultState);

interface PageScrollProviderProps {
  children: ReactNode;
}

export function PageScrollProvider({ children }: PageScrollProviderProps) {
  const [scrollContainerEl, setScrollContainerEl] = useState<HTMLElement | null>(null);
  const [hasHeaderControls, setHasHeaderControls] = useState(false);

  const registerScrollContainer = useCallback((element: HTMLElement | null) => {
    setScrollContainerEl(element);
  }, []);

  const { isScrolledFromTop, isScrolledFromBottom } = useScrollShadow(scrollContainerEl);

  const value = useMemo<PageScrollState>(() => ({
    isScrolledFromTop,
    isScrolledFromBottom,
    hasHeaderControls,
    registerScrollContainer,
    setHasHeaderControls,
  }), [isScrolledFromTop, isScrolledFromBottom, hasHeaderControls, registerScrollContainer]);

  return (
    <PageScrollContext.Provider value={value}>
      {children}
    </PageScrollContext.Provider>
  );
}

/** Returns the full page scroll state */
export function usePageScroll(): PageScrollState {
  return useContext(PageScrollContext);
}

/** Returns just the registerScrollContainer callback (convenience for pages) */
export function useRegisterScrollContainer(): (element: HTMLElement | null) => void {
  return useContext(PageScrollContext).registerScrollContainer;
}
