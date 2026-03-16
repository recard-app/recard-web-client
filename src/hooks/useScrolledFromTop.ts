import { useState, useEffect, useCallback, RefObject } from 'react';

/**
 * Detects whether a scrollable container is scrolled away from the top.
 * Returns `true` when scrollTop > 0, `false` when at top.
 *
 * @param ref - Ref to the scrollable container element
 * @param onChange - Optional callback fired when the scrolled state changes
 * @returns boolean indicating whether the container is scrolled from top
 */
export function useScrolledFromTop(
  ref: RefObject<HTMLElement | null>,
  onChange?: (isScrolled: boolean) => void
): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const scrolled = el.scrollTop > 0;
    setIsScrolled(scrolled);
  }, [ref]);

  useEffect(() => {
    onChange?.(isScrolled);
  }, [isScrolled, onChange]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check initial state
    handleScroll();

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [ref, handleScroll]);

  return isScrolled;
}
