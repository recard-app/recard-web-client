import { createContext, useCallback, useContext, useEffect, useRef, useState, useMemo } from 'react';
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

  // Guard against cleanup race conditions during route transitions.
  // Ref callbacks (commit phase) fire BEFORE effect cleanups (passive phase),
  // so ScrollContainerCleanup's null call can clobber a new page's registration.
  // This flag prevents stale cleanups from overriding a fresh registration.
  const justRegisteredRef = useRef(false);

  const registerScrollContainer = useCallback((element: HTMLElement | null) => {
    if (element !== null) {
      justRegisteredRef.current = true;
      setScrollContainerEl(element);
      requestAnimationFrame(() => {
        justRegisteredRef.current = false;
      });
    } else {
      if (justRegisteredRef.current) return;
      setScrollContainerEl(null);
    }
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

/**
 * Renders nothing. On unmount, clears the registered scroll container
 * so stale references don't keep the header shadow visible across route changes.
 * Place inside a keyed wrapper that remounts on navigation.
 */
export function ScrollContainerCleanup(): null {
  const register = useContext(PageScrollContext).registerScrollContainer;
  useEffect(() => () => register(null), [register]);
  return null;
}
